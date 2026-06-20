import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export const getSettings = async () => {
  const snapshot = await getDoc(doc(db, "settings", "school"));
  return snapshot.exists() ? snapshot.data() : {};
};

export const updateSettings = async (data) => {
  await setDoc(doc(db, "settings", "school"), data, { merge: true });
};
