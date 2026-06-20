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

export const addResult = async (resultData) => {
  const docRef = await addDoc(collection(db, "results"), resultData);
  return docRef.id;
};

export const getResults = async () => {
  const snapshot = await getDocs(collection(db, "results"));
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const getStudentResultsByTermAndSession = async (
  studentId,
  term,
  session,
) => {
  const q = query(
    collection(db, "results"),
    where("studentId", "==", studentId),
    where("term", "==", term),
    where("session", "==", session),
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const updateResult = async (id, resultData) => {
  await updateDoc(doc(db, "results", id), resultData);
};

export const deleteResult = async (id) => {
  await deleteDoc(doc(db, "results", id));
};

export const getGrade = (score) => {
  if (score >= 70) return "A";
  if (score >= 60) return "B";
  if (score >= 50) return "C";
  if (score >= 45) return "D";
  if (score >= 40) return "E";
  return "F";
};

export const buildResultData = (
  studentId,
  subjectId,
  score,
  term,
  session,
  studentName,
  subjectName,
) => ({
  studentId,
  subjectId,
  studentName,
  subjectName,
  score: Number(score),
  grade: getGrade(Number(score)),
  term,
  session,
});
