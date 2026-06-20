import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

const getSchoolInitials = (schoolName) => {
  if (!schoolName) return "SCH";
  return schoolName
    .split(" ")
    .filter((word) => word.length > 2)
    .map((word) => word[0].toUpperCase())
    .join("")
    .slice(0, 3);
};

export const generateMatricNumber = async (schoolName) => {
  const initials = getSchoolInitials(schoolName);
  const year = new Date().getFullYear();

  const snapshot = await getDocs(collection(db, "students"));
  const count = snapshot.size + 1;
  const padded = String(count).padStart(3, "0");

  return `${initials}/${year}/${padded}`;
};
