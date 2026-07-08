import { collection, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export const createLog = async (actionType, description, user) => {
  try {
    await addDoc(collection(db, "activity_logs"), {
      action: actionType,
      description: description,
      performedBy: user.uid,
      userName: user.name || "Staff Member",
      userRole: user.role, // 'admin' or 'teacher'
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("System logging failed:", error);
  }
};
