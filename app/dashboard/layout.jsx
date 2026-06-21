"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/useAuth";

const adminLinks = [
  { href: "/dashboard", label: "Dashboard", icon: "🏠" },
  { href: "/dashboard/students", label: "Students", icon: "🎓" },
  { href: "/dashboard/subjects", label: "Subjects", icon: "📚" },
  { href: "/dashboard/results", label: "Results", icon: "📝" },
  { href: "/dashboard/bulk-upload", label: "Bulk Upload", icon: "📤" },
  { href: "/dashboard/approvals", label: "Approvals", icon: "✅" },
  { href: "/dashboard/result-sheet", label: "Result Sheet", icon: "🗒️" },
  { href: "/dashboard/teachers", label: "Teachers", icon: "👨‍🏫" },
  { href: "/dashboard/settings", label: "Settings", icon: "⚙️" },
];

const teacherLinks = [
  { href: "/dashboard/students", label: "Students", icon: "🎓" },
  { href: "/dashboard/results", label: "Results", icon: "📝" },
  { href: "/dashboard/bulk-upload", label: "Bulk Upload", icon: "📤" },
  { href: "/dashboard/result-sheet", label: "Result Sheet", icon: "🗒️" },
];
export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, role, loading } = useAuth();

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  if (!user) return null;

  const navLinks = role === "admin" ? adminLinks : teacherLinks;

  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside className="w-64 bg-[#021024]/50 shadow-md flex flex-col">
        <div className="p-6 border-b">
          <h1 className="text-xl font-bold text-[#021024] uppercase">
            School Records
          </h1>
          <p className="text-2xl font-medium text-gray-400 mt-1 capitalize">
            {role}
          </p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition text-sm font-medium ${
                pathname === link.href
                  ? "bg-[#021024] text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <span>{link.icon}</span>
              <span>{link.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t">
          <button
            onClick={handleLogout}
            className="w-full text-left flex items-center gap-3 px-4 py-3 rounded-lg text-red-500 hover:bg-red-50 transition text-sm font-medium cursor-pointer"
          >
            <span>🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 p-6 overflow-y-auto">{children}</main>
    </div>
  );
}
