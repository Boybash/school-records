"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getUserRole, getUserData } from "@/lib/auth";
import { useRouter } from "next/navigation";

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/login");
      } else {
        const userRole = await getUserRole(currentUser.uid);
        const data = await getUserData(currentUser.uid);
        setUser(currentUser);
        setRole(userRole || "admin");
        setUserData(data);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  return { user, role, userData, loading };
};
