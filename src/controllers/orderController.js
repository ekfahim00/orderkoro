// src/controllers/orderController.js
import { db } from "../firebase/firebase.config";
import {
  addDoc,
  arrayUnion,
  collection,
  doc,
  getDocs,
  onSnapshot,
  query,
  updateDoc,
  where,
} from "firebase/firestore";

export const DELIVERY_FEE = 60;
export const VAT_RATE = 0.15;


export const ACTIVE_STATUSES = ["placed", "accepted", "preparing", "ready"];

export const calcTotals = (items = []) => {
  const subtotal = items.reduce(
    (s, it) => s + (Number(it.price || 0) * Number(it.quantity || 0)),
    0
  );
  const vat = subtotal * VAT_RATE;
  const delivery = items.length > 0 ? DELIVERY_FEE : 0;
  const total = subtotal + vat + delivery;
  return { subtotal, vat, delivery, total };
};

export const placeOrder = async ({
  customerId,
  customerName,
  customerPhone,
  customerAddress,
  restaurantId,      // the restaurant doc id (ownerId)
  orderType = "delivery",
  items,             // [{productId, name, price, quantity, image?}]
}) => {
  const now = Date.now();
  const { total, subtotal, vat, delivery } = calcTotals(items);

  const orderDoc = {
    orderId: "",
    customerId,
    customerName,
    customerPhone,
    customerAddress,
    restaurantId,
    items,
    total,
    subtotal,
    vat,
    delivery,
    orderType,
    status: "placed", // placed → accepted → preparing → ready → delivered / cancel
    history: [{ status: "placed", timestamp: now }],
    placedAt: now,
    updatedAt: now,
  };

  const ref = await addDoc(collection(db, "orders"), orderDoc);
  await updateDoc(doc(db, "orders", ref.id), { orderId: ref.id });
  return ref.id;
};

//  restaurant: update status
export const updateOrderStatus = async (orderId, newStatus) => {
  const now = Date.now();
  await updateDoc(doc(db, "orders", orderId), {
    status: newStatus,
    updatedAt: now,
    history: arrayUnion({ status: newStatus, timestamp: now }),
  });
};

// restaurant: subscribe to live orders (active statuses only)
export const subscribeLiveOrders = (restaurantId, onData, onErr) => {
  // No orderBy, so we don't require a compound index
  const q = query(
    collection(db, "orders"),
    where("restaurantId", "==", restaurantId),
    where("status", "in", ACTIVE_STATUSES)
  );
  return onSnapshot(
    q,
    (snap) => {
      const list = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .sort((a, b) => b.placedAt - a.placedAt);
      onData(list);
    },
    onErr
  );
};

// restaurant: subscribe to all orders (history)
export const subscribeAllOrders = (restaurantId, onData, onErr) => {
  const q = query(
    collection(db, "orders"),
    where("restaurantId", "==", restaurantId)
  );
  return onSnapshot(
    q,
    (snap) => {
      const list = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .sort((a, b) => b.placedAt - a.placedAt);
      onData(list);
    },
    onErr
  );
};

// one-time fetch
export const getAllOrdersOnce = async (restaurantId) => {
  const q = query(
    collection(db, "orders"),
    where("restaurantId", "==", restaurantId)
  );
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .sort((a, b) => b.placedAt - a.placedAt);
};
