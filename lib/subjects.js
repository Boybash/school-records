import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";

export const addSubject = async (subjectData) => {
  const docRef = await addDoc(collection(db, "subjects"), subjectData);
  return docRef.id;
};

export const getSubjects = async () => {
  const snapshot = await getDocs(collection(db, "subjects"));
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const updateSubject = async (id, subjectData) => {
  await updateDoc(doc(db, "subjects", id), subjectData);
};

export const deleteSubject = async (id) => {
  await deleteDoc(doc(db, "subjects", id));
};
