"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/useAuth";
import { useSessionTimeout } from "@/lib/useSessionTimeout";
import SessionWarning from "@/components/sessionWarning";
import { useState, useEffect } from "react";
import { getTeachers } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";

const adminLinks = [
  { href: "/dashboard", label: "Dashboard", icon: "/people-roof.png" },
  {
    href: "/dashboard/students",
    label: "Students",
    icon: "/graduation-cap.png",
  },
  { href: "/dashboard/subjects", label: "Subjects", icon: "/book.png" },
  { href: "/dashboard/results", label: "Results", icon: "/sheet.png" },
  { href: "/dashboard/comments", label: "Comments", icon: "/comment-alt.png" },
  { href: "/dashboard/bulk-upload", label: "Bulk Upload", icon: "/upload.png" },
  { href: "/dashboard/approvals", label: "Approvals", icon: "/checkbox.png" },
  {
    href: "/dashboard/result-sheet",
    label: "Result Sheet",
    icon: "/result.png",
  },
  { href: "/dashboard/teachers", label: "Teachers", icon: "/workshop.png" },
  { href: "/dashboard/settings", label: "Settings", icon: "/settings.png" },
  {
    href: "/dashboard/activity",
    label: "Activity Logs",
    icon: "/log-file.png",
  },
];

const teacherLinks = [
  {
    href: "/dashboard/students",
    label: "Students",
    icon: "/graduation-cap.png",
  },
  { href: "/dashboard/results", label: "Results", icon: "/sheet.png" },
  { href: "/dashboard/comments", label: "Comments", icon: "/comment-alt.png" },
  { href: "/dashboard/approvals", label: "Approvals", icon: "/checkbox.png" },
  { href: "/dashboard/bulk-upload", label: "Bulk Upload", icon: "/upload.png" },
  {
    href: "/dashboard/result-sheet",
    label: "Result Sheet",
    icon: "/result.png",
  },
];

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, role, loading, userData } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { data: teachers = [], isLoading } = useQuery({
    queryKey: ["teachers"],
    queryFn: getTeachers,
  });

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  const { showWarning, resetTimer } = useSessionTimeout(handleLogout);

  // Clean redirection management for absolute assurance against hanging states
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  if (!user) return null;

  const navLinks = role === "admin" ? adminLinks : teacherLinks;
  const isTeacher = role === "teacher";
  const isAdmin = role === "admin";

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-100">
      {/* Session Warning */}
      {showWarning && (
        <SessionWarning onStay={resetTimer} onLogout={handleLogout} />
      )}

      {/* Background overlay that allows clicking out of mobile menu */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Handles native responsive state cleanly */}
      <aside
        className={`w-64 shadow-md flex flex-col shrink-0 
    /* 1. Mobile Setup: Always fixed and ready to animate */
    fixed inset-y-0 left-0 top-18 z-50 transition-transform duration-300 ease-in-out
    
    /* 2. Desktop Setup: Reset position so it stays put */
    md:static md:translate-x-0 md:bg-primary-50
    
    /* 3. Dynamic Sliding & Background Logic */
    ${
      sidebarOpen
        ? "translate-x-0 bg-primary"
        : "-translate-x-full bg-primary-50"
    }
  `}
      >
        <div className="p-6 border-b border-white flex flex-col justify-between md:block">
          <div>
            <h1
              className={`text-xl font-bold text-primary uppercase ${sidebarOpen ? "text-white" : "text-primary"}`}
            >
              School Records
            </h1>
          </div>
          <div>
            {isAdmin && userData ? (
              <div className="text-left">
                <h1 className="text-xl font-bold text-gray-400 uppercase">
                  {userData.name || "Unnamed Admin"}
                </h1>
                <p className="text-xl font-semibold text-gray-400 uppercase tracking-wider">
                  {role}
                </p>
              </div>
            ) : isAdmin ? (
              <p className="text-gray-400 italic">Loading profile details...</p>
            ) : null}
          </div>

          <div>
            {isTeacher && userData ? (
              <div className="text-left">
                <h1 className="text-xl text-left font-bold text-gray-400 uppercase">
                  {userData.name || "Unnamed Teacher"}
                </h1>
                <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                  {role}
                </p>
                <h1 className="text-base font-bold text-gray-700 mt-1">
                  {userData.classes?.join(", ") || "None"}
                </h1>
              </div>
            ) : isTeacher ? (
              <p className="text-gray-400 italic">Loading profile details...</p>
            ) : null}
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-0 overflow-y-auto">
          {navLinks.map((link) => {
            // Checks if path precisely matches or belongs down the deep sub-route structure
            const isActive =
              pathname === link.href ||
              (link.href !== "/dashboard" && pathname.startsWith(link.href));

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-md transition text-sm font-medium ${
                  isActive
                    ? "bg-primary text-white"
                    : "text-white hover:bg-gray-100 hover:text-primary transition"
                }`}
              >
                <img
                  className="w-9 h-9 bg-white p-2 rounded-full object-contain"
                  src={link.icon}
                  alt={link.label}
                />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white">
          <button
            onClick={handleLogout}
            className="w-full text-left flex items-center gap-3 px-4 py-3 rounded-md text-red-800 hover:bg-red-50 transition text-sm font-medium cursor-pointer"
          >
            <img
              className="w-9 h-9 bg-white p-2 rounded-full object-contain"
              src="/user-logout.png"
              alt="logout"
            />
            <span className="font-semibold">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content View Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Header - Strictly mobile and hidden on md breakpoints and above */}
        <header className="md:hidden flex items-center justify-between bg-white shadow-sm px-6 py-4 sticky top-0 z-30">
          <img
            src="/shalomlogo.svg"
            alt="Shalom logo"
            className="w-10 h-10 shadow-sm"
          />
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="focus:outline-none"
          >
            <img
              src={sidebarOpen ? "/xmark.png" : "/menu.png"}
              alt="sidebar toggle"
              className="w-7 h-7 cursor-pointer"
            />
          </button>
        </header>

        {/* Children Render Area */}
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
