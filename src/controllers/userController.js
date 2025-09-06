import { db } from "../firebase/firebase.config";
import { doc, getDoc, onSnapshot, setDoc } from "firebase/firestore";
import { defaultUser } from "../models/userModel";

// One-time fetch
export const getUserInfo = async (uid) => {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : { ...defaultUser, uid };
};

// Live updates 
export const subscribeUserInfo = (uid, onOk, onErr) => {
  const ref = doc(db, "users", uid);
  return onSnapshot(
    ref,
    (snap) => onOk(snap.exists() ? snap.data() : { ...defaultUser, uid }),
    onErr
  );
};

// Save profile 
export const saveUserInfo = async (uid, data) => {
  const ref = doc(db, "users", uid);
  // ensure uid persists
  await setDoc(ref, { ...data, uid }, { merge: true });
};
