import { db } from "../firebase/firebase.config";
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDocs,
  query,
  where,
  orderBy,
  arrayUnion
} from "firebase/firestore";
import { defaultOrder } from "../models/orderModel";

export const placeOrder = async (orderData) => {
  const order = {
    ...defaultOrder,
    ...orderData,
    placedAt: Date.now(),
    updatedAt: Date.now(),
    history: [
      { status: "placed", timestamp: Date.now() }
    ]
  };
  const docRef = await addDoc(collection(db, "orders"), order);
  return docRef.id;
};

export const updateOrderStatus = async (orderId, newStatus) => {
  const docRef = doc(db, "orders", orderId);
  await updateDoc(docRef, {
    status: newStatus,
    updatedAt: Date.now(),
    history: arrayUnion({ status: newStatus, timestamp: Date.now() })
  });
};

export const getLiveOrders = async (restaurantId) => {
  const q = query(
    collection(db, "orders"),
    where("restaurantId", "==", restaurantId),
    where("status", "!=", "delivered"),
    orderBy("placedAt", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};
