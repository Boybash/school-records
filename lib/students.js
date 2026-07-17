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
  writeBatch,
} from "firebase/firestore";

export const addStudent = async (studentData) => {
  const docRef = await addDoc(collection(db, "students"), studentData);
  return docRef.id;
};

export const getStudentsForUser = async () => {
  const snapshot = await getDocs(collection(db, "students"));
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const updateStudent = async (id, studentData) => {
  await updateDoc(doc(db, "students", id), studentData);
};

export const deleteStudent = async (id) => {
  // Delete all results for this student
  const q = query(collection(db, "results"), where("studentId", "==", id));
  const snapshot = await getDocs(q);

  // Use batch delete for efficiency
  const batch = writeBatch(db);
  snapshot.docs.forEach((resultDoc) => {
    batch.delete(resultDoc.ref);
  });

  // Delete the student
  batch.delete(doc(db, "students", id));

  // Commit everything at once
  await batch.commit();
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

// Add this to the bottom of your @/lib/students.js
export const getStudentCategory = (className) => {
  if (!className) return "Junior";
  const upperClass = className.toUpperCase();

  if (upperClass.includes("JSS")) return "Junior";
  if (upperClass.includes("SS")) return "Senior";

  return "Junior";
};
