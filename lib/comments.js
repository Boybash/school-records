import { db } from "./firebase";
import {
  doc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";

// --- FETCH COMMENTS FUNCTION ---
export async function getTeacherCommentsByTermAndSession(
  term,
  session,
  selectedClass,
) {
  try {
    if (!selectedClass) return [];
    const commentsRef = collection(db, "comments");
    const q = query(
      commentsRef,
      where("term", "==", term),
      where("session", "==", session),
      where("class", "==", selectedClass),
    );

    const querySnapshot = await getDocs(q);
    const comments = [];
    querySnapshot.forEach((doc) => {
      comments.push({ id: doc.id, ...doc.data() });
    });
    return comments;
  } catch (error) {
    console.error("Permission or Query Error:", error);
    throw error;
  }
}

// --- SAVE COMMENT FUNCTION ---
export async function saveTeacherComment(payload) {
  const { studentId, term, session, teacherComment, principalComment } =
    payload;

  // Fallback check to capture either property key names accurately
  const targetClass = payload.class || payload.className;

  if (!targetClass) {
    throw new Error(
      "Missing required 'class' attribute inside the data payload.",
    );
  }

  // Generate the unique document ID to prevent duplicates
  const commentDocId = `${studentId}_${term.replace(/\s+/g, "")}_${session.replace(/\//g, "")}`;

  try {
    await setDoc(
      doc(db, "comments", commentDocId),
      {
        studentId,
        class: targetClass, // Guaranteed to write to the exact key name your Firestore rule expects
        term,
        session,
        teacherComment: teacherComment || "", // Guarantee empty string strings instead of null
        principalComment: principalComment || "", // Essential for your resource == null rules guard
        updatedAt: new Date().toISOString(),
      },
      { merge: true },
    );

    return { id: commentDocId, ...payload };
  } catch (error) {
    console.error("Error writing comment to Firestore: ", error);
    throw error;
  }
}
