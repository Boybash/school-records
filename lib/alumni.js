import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  deleteDoc,
  getDoc,
} from "firebase/firestore";

export const graduateStudent = async (studentId) => {
  // 1. Guard against invalid or missing IDs
  if (!studentId || typeof studentId !== "string") {
    console.error("Invalid studentId provided to graduateStudent:", studentId);
    throw new Error("Invalid student ID format provided.");
  }

  const studentRef = doc(db, "students", studentId);
  const studentSnap = await getDoc(studentRef);

  if (!studentSnap.exists()) {
    throw new Error(
      "Student record does not exist in the active students database.",
    );
  }

  const studentData = studentSnap.data();

  // 2. Safely transform data to match your Alumni fields (e.g. mapping class to graduation metrics)
  const alumniPayload = {
    ...studentData,
    originalId: studentId,
    graduatedAt: new Date().toISOString(),
    // Fallbacks to prevent missing field errors in alumni directory
    graduationYear: new Date().getFullYear(),
    department: studentData.class || "General",
  };

  // 3. Add to alumni collection
  await addDoc(collection(db, "alumni"), alumniPayload);

  // 4. Remove from students collection
  await deleteDoc(studentRef);
};

export const getAlumni = async () => {
  const snapshot = await getDocs(collection(db, "alumni"));
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};
