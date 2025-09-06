import { db } from "../firebase/firebase.config";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { defaultRestaurant } from "../models/restaurantModel";
import { collection, getDocs, query, orderBy } from "firebase/firestore";

export const getRestaurantInfo = async (ownerId) => {
  const docRef = doc(db, "restaurants", ownerId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data();
  } else {
    return { ...defaultRestaurant, ownerId };
  }
};

export const saveRestaurantInfo = async (ownerId, data) => {
  const docRef = doc(db, "restaurants", ownerId);
  await setDoc(docRef, { ...data, ownerId }, { merge: true });
};

export const getAllRestaurants = async () => {
  const q = query(collection(db, "restaurants"), orderBy("name"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};
