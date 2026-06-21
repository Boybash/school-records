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

export const getPendingResults = async () => {
  const q = query(collection(db, "results"), where("status", "==", "pending"));
  const snapshot = await getDocs(q);
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
  const results = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

  // Only show approved results or results with no status (old data)
  return results.filter((r) => r.status === "approved" || !r.status);
};

export const getClassRanking = async (className, term, session) => {
  const q = query(
    collection(db, "results"),
    where("term", "==", term),
    where("session", "==", session),
    where("status", "==", "approved"),
  );
  const snapshot = await getDocs(q);
  const results = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

  const studentSnapshot = await getDocs(
    query(collection(db, "students"), where("class", "==", className)),
  );
  const classStudents = studentSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  const studentTotals = classStudents.map((student) => {
    const studentResults = results.filter((r) => r.studentId === student.id);
    const total = studentResults.reduce((sum, r) => sum + r.score, 0);
    return { studentId: student.id, total };
  });

  studentTotals.sort((a, b) => b.total - a.total);

  const positions = {};
  studentTotals.forEach((s, index) => {
    positions[s.studentId] = index + 1;
  });

  return { positions, total: classStudents.length };
};

export const approveResult = async (id) => {
  await updateDoc(doc(db, "results", id), { status: "approved" });
};

export const rejectResult = async (id) => {
  await updateDoc(doc(db, "results", id), { status: "rejected" });
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
  ca,
  exam,
  term,
  session,
  studentName,
  subjectName,
  role,
) => {
  const total = Number(ca) + Number(exam);
  return {
    studentId,
    subjectId,
    studentName,
    subjectName,
    ca: Number(ca),
    exam: Number(exam),
    score: total,
    grade: getGrade(total),
    term,
    session,
    status: role === "admin" ? "approved" : "pending",
  };
};

export const getOrdinal = (n) => {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};
