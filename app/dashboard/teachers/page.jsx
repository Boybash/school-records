"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createTeacher, getTeachers, deleteTeacher } from "@/lib/auth";
import { getSubjects } from "@/lib/subjects";
import { getStudents } from "@/lib/students";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";

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
    queryFn: getStudents,
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
      await createTeacher(
        email,
        password,
        name,
        subjectId,
        selectedSubject.name,
        selectedClasses,
      );
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
    },
    onError: () => {
      alert("Error creating teacher. Check the details and try again.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTeacher,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teachers"] });
    },
  });

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this teacher?")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Teachers</h2>

      {/* Add Teacher Form */}
      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Add New Teacher</h3>

        {step === 1 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-4">
              <input
                type="text"
                placeholder="Full Name"
                className="border p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-400"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <input
                type="email"
                placeholder="Email"
                className="border p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-400"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <input
                type="password"
                placeholder="Password"
                className="border p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-400"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <select
                className="w-full border p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-400"
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
              <label className="text-sm text-gray-500 mb-2 block">
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
                          ? "bg-blue-600 text-white border-blue-600"
                          : "text-gray-600 border-gray-300 hover:bg-gray-100"
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
              className="mt-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
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
                className="border p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-400"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
              />
              <input
                type="password"
                placeholder="Your admin password"
                className="border p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-400"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
              />
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => createMutation.mutate()}
                disabled={createMutation.isPending}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
              >
                {createMutation.isPending ? "Creating..." : "Create Teacher"}
              </button>
              <button
                onClick={() => setStep(1)}
                className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition"
              >
                Back
              </button>
            </div>
          </>
        )}
      </div>

      {/* Teachers Table */}
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="text-lg font-semibold mb-4">All Teachers</h3>
        {isLoading ? (
          <p className="text-gray-400">Loading teachers...</p>
        ) : teachers.length === 0 ? (
          <p className="text-gray-400">No teachers added yet.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b">
                <th className="pb-3 text-gray-500">#</th>
                <th className="pb-3 text-gray-500">Name</th>
                <th className="pb-3 text-gray-500">Email</th>
                <th className="pb-3 text-gray-500">Subject</th>
                <th className="pb-3 text-gray-500">Classes</th>
                <th className="pb-3 text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {teachers.map((teacher, index) => (
                <tr key={teacher.id} className="border-b last:border-0">
                  <td className="py-3 text-gray-400">{index + 1}</td>
                  <td className="py-3">{teacher.name}</td>
                  <td className="py-3">{teacher.email}</td>
                  <td className="py-3">{teacher.subjectName}</td>
                  <td className="py-3">{teacher.classes?.join(", ")}</td>
                  <td className="py-3">
                    <button
                      onClick={() => handleDelete(teacher.id)}
                      className="text-red-500 hover:underline text-sm"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
