import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export const createLog = async (actionType, description, currentUser) => {
  try {
    await addDoc(collection(db, "activity_logs"), {
      action: actionType,
      description: description,
      performedBy: currentUser?.uid || "unknown",
      userName: currentUser?.name || "Staff Member",
      userRole: currentUser?.role || "staff", // 'admin' or 'teacher'
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("System logging failed:", error);
  }
};

export const fetchSystemLogs = async () => {
  try {
    const logsRef = collection(db, "activity_logs");

    // Optimized: Sort by newest first and limit to the last 200 entries
    const q = query(logsRef, orderBy("timestamp", "desc"), limit(200));

    const logsSnapshot = await getDocs(q);
    const logs = logsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return logs;
  } catch (error) {
    console.error("Error fetching logs:", error);
    throw error;
  }
};
