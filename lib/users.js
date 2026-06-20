import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  getDoc,
} from "firebase/firestore";

export const getUserRole = async (uid) => {
  const snapshot = await getDoc(doc(db, "users", uid));
  return snapshot.exists() ? snapshot.data().role : null;
};

export const getUsers = async () => {
  const snapshot = await getDocs(collection(db, "users"));
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const addUser = async (uid, userData) => {
  await addDoc(collection(db, "users"), { uid, ...userData });
};

export const deleteUser = async (id) => {
  await deleteDoc(doc(db, "users", id));
};
