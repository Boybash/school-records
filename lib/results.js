import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
} from "firebase/firestore";
import { createLog } from "./activity";

export const addResult = async (resultData) => {
  const docRef = await addDoc(collection(db, "results"), resultData);
  return docRef.id;
};

export const getResults = async () => {
  const snapshot = await getDocs(collection(db, "results"));
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const getResultsByUploader = async (uid) => {
  const q = query(collection(db, "results"), where("uploadedBy", "==", uid));
  const snapshot = await getDocs(q);
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
    where("status", "==", "approved"),
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
  await createLog(
    "RESULT_APPROVAL",
    `Approved ${subjectName} score for student ${studentName}`,
    currentUser,
  );
};

export const rejectResult = async (id) => {
  await updateDoc(doc(db, "results", id), { status: "rejected" });
  await createLog(
    "RESULT_REJECTION",
    `Rejected ${subjectName} score for student ${studentName}`,
    currentUser,
  );
};

export const updateResult = async (id, resultData) => {
  await updateDoc(doc(db, "results", id), resultData);
  await createLog(
    "RESULT_UPDATE",
    `Modified ${resultData.subjectName} score for ${resultData.studentName} (Changed from ${oldScore} to ${resultData.score})`,
    currentUser,
  );
};

export const deleteResult = async (id) => {
  await deleteDoc(doc(db, "results", id));
  await createLog(
    "RESULT_DELETION",
    `Permanently deleted ${subjectName} record for student ${studentName}`,
    currentUser,
  );
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
  uid,
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
    uploadedBy: uid,
  };
};

export const getOrdinal = (n) => {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

export const checkDuplicateResult = async (
  studentId,
  subjectId,
  term,
  session,
) => {
  const q = query(
    collection(db, "results"),
    where("studentId", "==", studentId),
    where("subjectId", "==", subjectId),
    where("term", "==", term),
    where("session", "==", session),
  );
  const snapshot = await getDocs(q);
  return !snapshot.empty;
};

const buildCommentDocId = (studentId, term, session) => {
  const safeTerm = term.replace(/\s/g, "");
  const safeSession = session.replace(/\//g, "").replace(/-/g, "");
  return `${studentId}_${safeTerm}_${safeSession}`;
};

export async function getCommentsByTermAndSession(studentId, term, session) {
  if (!studentId || !term || !session) return null;
  const docId = buildCommentDocId(studentId, term, session);
  try {
    const docRef = doc(db, "comments", docId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    }
    return { teacherComment: "", principalComment: "" };
  } catch (error) {
    console.error("Error fetching comments from Firestore:", error);
    throw error;
  }
}

export async function saveComment(studentId, term, session, payload) {
  if (!studentId || !term || !session)
    throw new Error("Missing tracking parameters");
  const docId = buildCommentDocId(studentId, term, session);
  try {
    const docRef = doc(db, "comments", docId);
    await setDoc(
      docRef,
      {
        studentId,
        term,
        session,
        ...payload,
        updatedAt: new Date().toISOString(),
      },
      { merge: true },
    );
    return { success: true };
  } catch (error) {
    console.error("Error saving comment to Firestore:", error);
    throw error;
  }
}
