import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
} from "firebase/firestore";

export const addStudent = async (studentData) => {
  const docRef = await addDoc(collection(db, "students"), studentData);
  return docRef.id;
};

export const getStudents = async () => {
  const snapshot = await getDocs(collection(db, "students"));
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const updateStudent = async (id, studentData) => {
  await updateDoc(doc(db, "students", id), studentData);
};

export const deleteStudent = async (id) => {
  await deleteDoc(doc(db, "students", id));
};

export const getStudentByMatric = async (matricNumber) => {
  const q = query(
    collection(db, "students"),
    where("matricNumber", "==", matricNumber),
  );
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const docSnap = snapshot.docs[0];
  return { id: docSnap.id, ...docSnap.data() };
};
