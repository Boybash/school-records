"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { addStudent, getStudents } from "@/lib/students";

export default function StudentsPage() {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [className, setClassName] = useState("");
  const [gender, setGender] = useState("Male");

  const { data: students = [], isLoading } = useQuery({
    queryKey: ["students"],
    queryFn: getStudents,
  });

  const mutation = useMutation({
    mutationFn: addStudent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      setName("");
      setClassName("");
      setGender("Male");
    },
  });

  const handleAddStudent = () => {
    if (!name || !className) return alert("Please fill in all fields");
    mutation.mutate({ name, class: className, gender });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h2 className="text-2xl font-semibold mb-6">Students</h2>

      {/* Add Student Form */}
      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Add New Student</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Full Name"
            className="border p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-400"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            type="text"
            placeholder="Class e.g JSS 1A"
            className="border p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-400"
            value={className}
            onChange={(e) => setClassName(e.target.value)}
          />
          <select
            className="border p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-400"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
          >
            <option>Male</option>
            <option>Female</option>
          </select>
        </div>
        <button
          onClick={handleAddStudent}
          disabled={mutation.isPending}
          className="mt-4 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
        >
          {mutation.isPending ? "Adding..." : "Add Student"}
        </button>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="text-lg font-semibold mb-4">All Students</h3>
        {isLoading ? (
          <p className="text-gray-400">Loading students...</p>
        ) : students.length === 0 ? (
          <p className="text-gray-400">No students added yet.</p>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b">
                <th className="pb-3 text-gray-500">#</th>
                <th className="pb-3 text-gray-500">Name</th>
                <th className="pb-3 text-gray-500">Class</th>
                <th className="pb-3 text-gray-500">Gender</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student, index) => (
                <tr key={student.id} className="border-b last:border-0">
                  <td className="py-3 text-gray-400">{index + 1}</td>
                  <td className="py-3">{student.name}</td>
                  <td className="py-3">{student.class}</td>
                  <td className="py-3">{student.gender}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
