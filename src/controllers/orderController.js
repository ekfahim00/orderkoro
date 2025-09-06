// src/controllers/orderController.js
import { db } from "../firebase/firebase.config";
import {
  addDoc,
  arrayUnion,
  collection,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore";

// --- constants & helpers ---
export const DELIVERY_FEE = 60;
export const VAT_RATE = 0.15;

export const calcTotals = (items = []) => {
  const subtotal = items.reduce((s, it) => s + (Number(it.price || 0) * Number(it.quantity || 0)), 0);
  const vat = subtotal * VAT_RATE;
  const delivery = items.length > 0 ? DELIVERY_FEE : 0;
  const total = subtotal + vat + delivery;
  return { subtotal, vat, delivery, total };
};

// --- placing an order (customer) ---
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
  const { subtotal, vat, delivery, total } = calcTotals(items);

  const orderDoc = {
    // your defaultOrder structure, plus a few extras for convenience
    orderId: "", // we'll backfill with doc id after addDoc
    customerId,
    restaurantId,
    items,
    total,
    subtotal,
    vat,
    delivery,
    orderType,
    status: "placed", // placed → accepted → preparing → ready → delivered / cancel
    history: [{ status: "placed", timestamp: now }],
    customerName,
    customerPhone,
    customerAddress,
    placedAt: now,
    updatedAt: now,
  };

  const ref = await addDoc(collection(db, "orders"), orderDoc);
  await updateDoc(doc(db, "orders", ref.id), { orderId: ref.id }); // backfill
  return ref.id;
};

// --- status updates (restaurant) ---
export const updateOrderStatus = async (orderId, newStatus) => {
  const now = Date.now();
  await updateDoc(doc(db, "orders", orderId), {
    status: newStatus,
    updatedAt: now,
    history: arrayUnion({ status: newStatus, timestamp: now }),
  });
};

// --- live orders subscription (restaurant dashboard) ---
// Use "status IN [placed,accepted,preparing,ready]" and sort client-side to avoid composite index headaches.
export const subscribeLiveOrders = (restaurantId, cb, errCb) => {
  // We avoid "status != delivered" to reduce composite index requirements
  const q = query(
    collection(db, "orders"),
    where("restaurantId", "==", restaurantId),
    where("status", "in", ["placed", "accepted", "preparing", "ready"])
    // no orderBy — we'll sort client-side by placedAt desc
  );
  return onSnapshot(q, (snap) => {
    const data = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      .sort((a,b) => b.placedAt - a.placedAt);
    cb(data);
  }, errCb);
};

// --- all orders (history) ---
export const getAllOrders = async (restaurantId) => {
  const q = query(
    collection(db, "orders"),
    where("restaurantId", "==", restaurantId)
    // no orderBy; sort client-side to avoid indexes
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
    .sort((a,b) => b.placedAt - a.placedAt);
};
