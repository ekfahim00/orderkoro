import { auth, db } from "../firebase/firebase.config";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

export const handleSignup = async (email, password, role) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  await setDoc(doc(db, "users", user.uid), {
    email,
    role,
  });

  return user;
};

export const handleLogin = async (email, password) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  const userSnap = await getDoc(doc(db, "users", user.uid));
  if (!userSnap.exists()) throw new Error("User role not found");

  return { user, role: userSnap.data().role };
};
