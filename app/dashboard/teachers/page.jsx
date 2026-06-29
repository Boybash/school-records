"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createTeacher, getTeachers, deleteTeacher } from "@/lib/auth";
import { getSubjects } from "@/lib/subjects";
import { getStudentsForUser } from "@/lib/students";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { TableSkeleton } from "@/components/skeleton";
import { resetTeacherPassword } from "@/lib/resetPassword";
import { signOut } from "firebase/auth";
import Pagination from "@/components/pagination";

export default function TeachersPage() {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [selectedClasses, setSelectedClasses] = useState([]);
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [step, setStep] = useState(1);
  const [resetingId, setResetingId] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [showPasword, setShowPassword] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const { data: teachers = [], isLoading } = useQuery({
    queryKey: ["teachers"],
    queryFn: getTeachers,
  });

  const { data: subjects = [] } = useQuery({
    queryKey: ["subjects"],
    queryFn: getSubjects,
  });

  const { data: students = [] } = useQuery({
    queryKey: ["students"],
    queryFn: getStudentsForUser,
  });

  // Get unique classes from students
  const classes = [...new Set(students.map((s) => s.class))].sort();

  const toggleClass = (cls) => {
    setSelectedClasses((prev) =>
      prev.includes(cls) ? prev.filter((c) => c !== cls) : [...prev, cls],
    );
  };

  const createMutation = useMutation({
    mutationFn: async () => {
      const selectedSubject = subjects.find((s) => s.id === subjectId);

      // Step 1 - Create teacher account
      await createTeacher(
        email,
        password,
        name,
        subjectId,
        selectedSubject.name,
        selectedClasses,
      );

      // Step 2 - Sign back in as admin
      await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teachers"] });
      setName("");
      setEmail("");
      setPassword("");
      setSubjectId("");
      setSelectedClasses([]);
      setAdminEmail("");
      setAdminPassword("");
      setStep(1);
      alert("Teacher created successfully!");
    },
    onError: (error) => {
      // If teacher was created but re-login failed
      if (error.message.includes("email-already-in-use")) {
        alert(
          "Teacher account was created successfully! Please log in again manually.",
        );
        signOut(auth).then(() => {
          window.location.href = "/login";
        });
      } else {
        alert("Failed: " + error.message);
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: ({ id, uid }) => deleteTeacher(id, uid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teachers"] });
    },
  });

  const handleDelete = (id, uid) => {
    if (
      confirm(
        "Are you sure you want to delete this teacher? They will lose access immediately.",
      )
    ) {
      deleteMutation.mutate({ id, uid });
    }
  };

  function togglePasswordVisibility() {
    setShowPassword(!showPasword);
  }

  const handleResetPassword = async () => {
    if (!newPassword) return alert("Please enter a new password");
    if (newPassword.length < 6)
      return alert("Password must be at least 6 characters");
    setResetLoading(true);
    try {
      await resetTeacherPassword(resetingId, newPassword);
      setResetSuccess(true);
      setNewPassword("");
      setTimeout(() => {
        setResetingId(null);
        setResetSuccess(false);
      }, 2000);
    } catch (err) {
      alert("Failed to reset password: " + err.message);
    } finally {
      setResetLoading(false);
    }
  };

  const totalPages = Math.ceil(teachers.length / ITEMS_PER_PAGE);

  const paginatedTeachers = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return teachers.slice(start, start + ITEMS_PER_PAGE);
  }, [teachers, currentPage]);

  return (
    <div>
      <h2 className="text-xl font-bold mb-6 uppercase">Teachers</h2>

      {/* Add Teacher Form */}
      <div className="bg-primary rounded-xl shadow p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4 text-white">
          Add New Teacher
        </h3>

        {step === 1 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-4">
              <input
                type="text"
                placeholder="Full Name"
                className="border p-3 rounded-lg outline-none focus:ring-2 focus:ring-primary-50 bg-white"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <input
                type="email"
                placeholder="Email"
                className="border p-3 rounded-lg outline-none focus:ring-2 focus:ring-primary-50 bg-white"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              {/* Password with toggle */}
              <div className="relative">
                <input
                  type={showPasword ? "text" : "password"}
                  placeholder="Password"
                  className="w-full border p-3 rounded-lg outline-none focus:ring-2 focus:ring-primary-50 bg-white pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <img
                  onClick={togglePasswordVisibility}
                  src={showPasword ? "/hide eye.svg" : "/show eye.svg"}
                  alt="Toggle"
                  className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                />
              </div>

              <select
                className="w-full border p-3 rounded-lg outline-none focus:ring-2 focus:ring-primary-50 bg-white"
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
              >
                <option value="">Assign Subject</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Subject Assignment */}

            {/* Class Assignment */}
            <div className="mb-4">
              <label className="text-sm text-white mb-2 block">
                Assign Classes
              </label>
              {classes.length === 0 ? (
                <p className="text-gray-400 text-sm">
                  No classes found. Add students first.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {classes.map((cls) => (
                    <button
                      key={cls}
                      onClick={() => toggleClass(cls)}
                      className={`px-4 py-2 rounded-lg text-sm border transition ${
                        selectedClasses.includes(cls)
                          ? "bg-gray-100 text-primary border-blue-600"
                          : "text-white border-gray-300 hover:bg-gray-100"
                      }`}
                    >
                      {cls}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => {
                if (!name || !email || !password)
                  return alert("Please fill in all fields");
                if (!subjectId) return alert("Please assign a subject");
                if (selectedClasses.length === 0)
                  return alert("Please assign at least one class");
                setStep(2);
              }}
              className="mt-2 bg-gray-100 text-primary px-6 py-3 rounded-md font-semibold transition cursor-pointer"
            >
              Next
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <p className="text-sm text-gray-500 mb-4">
              Creating a teacher account will temporarily sign you out. Enter
              your admin credentials to sign back in automatically.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="email"
                placeholder="Your admin email"
                className="border p-3 rounded-lg outline-none focus:ring-2 focus:ring-primary-50 bg-white"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
              />
              <div className="relative">
                <input
                  type={showPasword ? "text" : "password"}
                  placeholder="Your admin password"
                  className=" w-full border p-3 rounded-lg outline-none focus:ring-2 focus:ring-primary-50 bg-white"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                />
                <img
                  onClick={togglePasswordVisibility}
                  src={showPasword ? "/hide eye.svg" : "/show eye.svg"}
                  alt="Toggle"
                  className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => createMutation.mutate()}
                disabled={createMutation.isPending}
                className="bg-gray-100 text-primary font-semibold px-6 py-3 rounded-md transition cursor-pointer"
              >
                {createMutation.isPending ? "Creating..." : "Create Teacher"}
              </button>
              <button
                onClick={() => setStep(1)}
                className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition cursor-pointer"
              >
                Back
              </button>
            </div>
          </>
        )}
      </div>

      {/* Teachers Table */}
      <div className="bg-primary rounded-xl shadow p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-6">
          <h3 className="text-lg font-semibold mb-4 text-white">
            All Teachers
          </h3>
          <p className="text-sm text-gray-400">
            Showing {paginatedTeachers.length} of {teachers.length} students
          </p>
        </div>
        {isLoading ? (
          <TableSkeleton rows={5} cols={6} dark={true} />
        ) : paginatedTeachers.length === 0 ? (
          <p className="text-gray-400">No teachers added yet.</p>
        ) : (
          <>
            {/* 1. MOBILE RESPONSIVE CARD VIEW (Visible below md screens) */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
              {paginatedTeachers.map((teacher, index) => (
                <div
                  key={teacher.id}
                  className="border border-white/10 bg-white/5 rounded-lg p-4 flex flex-col gap-3"
                >
                  {/* Header metadata row */}
                  <div className="flex justify-between items-center border-b border-white/10 pb-2 text-xs">
                    <span className="text-white/40 font-mono">
                      #{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                    </span>
                    <span className="text-yellow-400 font-medium truncate max-w-[200px]">
                      {teacher.email}
                    </span>
                  </div>

                  {/* Core Info */}
                  <div>
                    <h4 className="text-white font-semibold text-base">
                      {teacher.name}
                    </h4>
                    <p className="text-white/70 text-sm mt-0.5">
                      Subject:{" "}
                      <span className="text-white font-medium">
                        {teacher.subjectName}
                      </span>
                    </p>
                  </div>

                  {/* Target Classes badging container */}
                  <div className="bg-black/20 p-2 rounded-md text-xs">
                    <p className="text-white/50 font-medium mb-1">
                      Assigned Classes:
                    </p>
                    <p className="text-white font-medium truncate">
                      {teacher.classes?.join(", ") || "None"}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-1 mt-1 border-t border-white/5">
                    <button
                      onClick={() => setResetingId(teacher.uid)}
                      className="flex-1 text-center text-white bg-yellow-600 hover:bg-yellow-700 py-2 px-3 rounded-md text-xs font-medium transition cursor-pointer"
                    >
                      Reset Password
                    </button>
                    <button
                      onClick={() => handleDelete(teacher.id, teacher.uid)}
                      className="text-white cursor-pointer text-xs bg-red-600 hover:bg-red-700 py-2 px-3 rounded-md font-medium transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>

            {/* 2. DESKTOP TABULAR VIEW (Visible from md screens and above) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-sm text-white border-collapse table-fixed">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="pb-3 text-white/50 font-medium w-[5%]">#</th>
                    <th className="pb-3 text-white/50 font-medium w-[25%]">
                      Name
                    </th>
                    <th className="pb-3 text-white/50 font-medium w-[25%]">
                      Email
                    </th>
                    <th className="pb-3 text-white/50 font-medium w-[15%]">
                      Subject
                    </th>
                    <th className="pb-3 text-white/50 font-medium w-[12%]">
                      Classes
                    </th>
                    <th className="pb-3 text-white/50 font-medium w-[18%] text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedTeachers.map((teacher, index) => (
                    <tr
                      key={teacher.id}
                      className="border-b border-white/10 last:border-0 hover:bg-white/5 transition"
                    >
                      <td className="py-3 text-white/40">{index + 1}</td>
                      <td className="py-3 font-medium truncate pr-2">
                        {teacher.name}
                      </td>
                      <td className="py-3 truncate text-white/80 pr-2">
                        {teacher.email}
                      </td>
                      <td className="py-3 text-white/80 truncate">
                        {teacher.subjectName}
                      </td>
                      <td className="py-3 text-white/80 truncate">
                        {teacher.classes?.join(", ")}
                      </td>
                      <td className="py-3">
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => setResetingId(teacher.uid)}
                            className="text-white bg-yellow-600 hover:bg-yellow-700 px-3 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer whitespace-nowrap"
                          >
                            Reset Password
                          </button>
                          <button
                            onClick={() =>
                              handleDelete(teacher.id, teacher.uid)
                            }
                            className="text-white cursor-pointer text-xs bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded-md font-semibold transition"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>
      {/* Reset Password Modal */}
      {resetingId && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              Reset Teacher Password
            </h2>
            <p className="text-gray-500 text-sm mb-6">
              Enter a new password for this teacher. They will use this to log
              in.
            </p>

            {resetSuccess ? (
              <div className="text-center py-4">
                <p className="text-4xl mb-2">✅</p>
                <p className="text-green-600 font-semibold">
                  Password reset successfully!
                </p>
              </div>
            ) : (
              <>
                <input
                  type="password"
                  placeholder="New password (min 6 characters)"
                  className="w-full border p-3 rounded-lg outline-none focus:ring-2 focus:ring-primary-50 mb-4"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <div className="flex gap-3">
                  <button
                    onClick={handleResetPassword}
                    disabled={resetLoading}
                    className="flex-1 cursor-pointer bg-primary text-white py-3 rounded-lg font-semibold  transition"
                  >
                    {resetLoading ? "Resetting..." : "Reset Password"}
                  </button>
                  <button
                    onClick={() => {
                      setResetingId(null);
                      setNewPassword("");
                    }}
                    className="flex-1 cursor-pointer bg-primary text-gray-700 py-3 rounded-lg font-semibold transition"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
