"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getStudentByMatric } from "@/lib/students";

export default function ParentLoginPage() {
  const router = useRouter();
  const [matricNumber, setMatricNumber] = useState("");
  const [surname, setSurname] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!matricNumber || !surname) return setError("Please fill in all fields");
    setLoading(true);
    setError("");

    try {
      const student = await getStudentByMatric(matricNumber.toUpperCase());

      if (!student) {
        setError("Student not found. Check the matric number.");
        setLoading(false);
        return;
      }

      // Check surname matches (case insensitive)
      const studentSurname = student.name.split(" ")[0].toLowerCase();
      const enteredSurname = surname.trim().toLowerCase();

      if (studentSurname !== enteredSurname) {
        setError("Incorrect surname. Please try again.");
        setLoading(false);
        return;
      }

      // Save student id to sessionStorage and redirect
      sessionStorage.setItem("parentStudentId", student.id);
      router.push("/parent/result");
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-blue-600">Parent Portal</h1>
          <p className="text-gray-500 text-sm mt-1">
            Enter your child's matric number and surname to view their results
          </p>
        </div>

        {error && (
          <p className="text-red-500 text-sm text-center mb-4">{error}</p>
        )}

        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-500 mb-1 block">
              Matric Number
            </label>
            <input
              type="text"
              placeholder="e.g GFS/2025/001"
              className="w-full border p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-400"
              value={matricNumber}
              onChange={(e) => setMatricNumber(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm text-gray-500 mb-1 block">Surname</label>
            <input
              type="text"
              placeholder="Enter student's surname"
              className="w-full border p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-400"
              value={surname}
              onChange={(e) => setSurname(e.target.value)}
            />
          </div>
        </div>

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          {loading ? "Checking..." : "View Results"}
        </button>

        <p className="text-center text-xs text-gray-400 mt-4">
          Having trouble? Contact the school admin.
        </p>
      </div>
    </div>
  );
}
