import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs } from "firebase/firestore";

export const addStudent = async (studentData) => {
  const docRef = await addDoc(collection(db, "students"), studentData);
  return docRef.id;
};

export const getStudents = async () => {
  const snapshot = await getDocs(collection(db, "students"));
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};
