import { auth, db } from "@/lib/firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
} from "firebase/firestore";

export const loginUser = async (email, password) => {
  const userCredential = await signInWithEmailAndPassword(
    auth,
    email,
    password,
  );
  return userCredential.user;
};

export const getUserRole = async (uid) => {
  const snapshot = await getDoc(doc(db, "users", uid));
  return snapshot.exists() ? snapshot.data().role : "admin";
};

export const getUserData = async (uid) => {
  const snapshot = await getDoc(doc(db, "users", uid));
  return snapshot.exists() ? snapshot.data() : null;
};

export const createTeacher = async (
  email,
  password,
  name,
  subjectId,
  subjectName,
  classes,
) => {
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password,
  );
  const uid = userCredential.user.uid;
  console.log("Created teacher UID:", uid);
  await setDoc(doc(db, "users", uid), {
    uid,
    name,
    email,
    role: "teacher",
    subjectId,
    subjectName,
    classes, // array of class strings e.g ["JSS 1A", "JSS 2B"]
  });
  return uid;
};

export const getTeachers = async () => {
  const q = query(collection(db, "users"), where("role", "==", "teacher"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const deleteTeacher = async (id, uid) => {
  // Delete from Firebase Auth via API route
  await fetch("/api/delete-teacher", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ uid }),
  });

  // Delete from Firestore
  await deleteDoc(doc(db, "users", id));
};
