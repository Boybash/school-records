"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getStudents } from "@/lib/students";
import { getSubjects } from "@/lib/subjects";
import {
  addResult,
  getResults,
  updateResult,
  deleteResult,
  buildResultData,
  getGrade,
} from "@/lib/results";
import { useAuth } from "@/lib/useAuth";

const TERMS = ["1st Term", "2nd Term", "3rd Term"];

export default function ResultsPage() {
  const queryClient = useQueryClient();
  const [studentId, setStudentId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [score, setScore] = useState("");
  const [term, setTerm] = useState("1st Term");
  const [session, setSession] = useState("2024/2025");
  const [editingResult, setEditingResult] = useState(null);

  const { data: students = [] } = useQuery({
    queryKey: ["students"],
    queryFn: getStudents,
  });

  const { data: subjects = [] } = useQuery({
    queryKey: ["subjects"],
    queryFn: getSubjects,
  });

  const { data: results = [], isLoading } = useQuery({
    queryKey: ["results"],
    queryFn: getResults,
  });

  const { userData, role } = useAuth();

  // filter students by teacher's classes
  const visibleStudents =
    role === "teacher"
      ? students.filter((s) => userData?.classes?.includes(s.class))
      : students;

  // filter subjects to only teacher's subject
  const visibleSubjects =
    role === "teacher"
      ? subjects.filter((s) => s.id === userData?.subjectId)
      : subjects;

  // pre-select subject for teacher
  useState(() => {
    if (role === "teacher" && userData?.subjectId) {
      setSubjectId(userData.subjectId);
    }
  });

  const addMutation = useMutation({
    mutationFn: addResult,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["results"] });
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateResult(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["results"] });
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteResult,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["results"] });
    },
  });

  const resetForm = () => {
    setStudentId("");
    setSubjectId("");
    setScore("");
    setTerm("1st Term");
    setSession("2024/2025");
    setEditingResult(null);
  };

  const handleSubmit = () => {
    if (!studentId || !subjectId || !score)
      return alert("Please fill in all fields");
    if (score < 0 || score > 100)
      return alert("Score must be between 0 and 100");

    const selectedStudent = students.find((s) => s.id === studentId);
    const selectedSubject = subjects.find((s) => s.id === subjectId);

    const data = buildResultData(
      studentId,
      subjectId,
      score,
      term,
      session,
      selectedStudent.name,
      selectedSubject.name,
    );

    if (editingResult) {
      updateMutation.mutate({ id: editingResult.id, data });
    } else {
      addMutation.mutate(data);
    }
  };

  const handleEdit = (result) => {
    setEditingResult(result);
    setStudentId(result.studentId);
    setSubjectId(result.subjectId);
    setScore(result.score);
    setTerm(result.term);
    setSession(result.session);
  };

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this result?")) {
      deleteMutation.mutate(id);
    }
  };

  const isPending = addMutation.isPending || updateMutation.isPending;

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Results</h2>

      {/* Add/Edit Form */}
      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">
          {editingResult ? "Edit Result" : "Enter Result"}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <select
            className="border p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-400"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
          >
            <option value="">Select Student</option>
            {visibleStudents.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} — {s.class}
              </option>
            ))}
          </select>

          <select
            className="border p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-400"
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
          >
            <option value="">Select Subject</option>
            {visibleSubjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          <input
            type="number"
            placeholder="Score (0 - 100)"
            className="border p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-400"
            value={score}
            onChange={(e) => setScore(e.target.value)}
            min={0}
            max={100}
          />

          <select
            className="border p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-400"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
          >
            {TERMS.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Session e.g 2024/2025"
            className="border p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-400"
            value={session}
            onChange={(e) => setSession(e.target.value)}
          />
        </div>

        <div className="flex gap-3 mt-4">
          <button
            onClick={handleSubmit}
            disabled={isPending}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            {isPending
              ? "Saving..."
              : editingResult
                ? "Update Result"
                : "Save Result"}
          </button>
          {editingResult && (
            <button
              onClick={resetForm}
              className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="text-lg font-semibold mb-4">All Results</h3>
        {isLoading ? (
          <p className="text-gray-400">Loading results...</p>
        ) : results.length === 0 ? (
          <p className="text-gray-400">No results recorded yet.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b">
                <th className="pb-3 text-gray-500">#</th>
                <th className="pb-3 text-gray-500">Student</th>
                <th className="pb-3 text-gray-500">Subject</th>
                <th className="pb-3 text-gray-500">Score</th>
                <th className="pb-3 text-gray-500">Grade</th>
                <th className="pb-3 text-gray-500">Term</th>
                <th className="pb-3 text-gray-500">Session</th>
                <th className="pb-3 text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {results.map((result, index) => (
                <tr key={result.id} className="border-b last:border-0">
                  <td className="py-3 text-gray-400">{index + 1}</td>
                  <td className="py-3">{result.studentName}</td>
                  <td className="py-3">{result.subjectName}</td>
                  <td className="py-3">{result.score}</td>
                  <td className="py-3 font-bold">
                    <span
                      className={
                        result.grade === "A"
                          ? "text-green-600"
                          : result.grade === "B"
                            ? "text-blue-600"
                            : result.grade === "F"
                              ? "text-red-600"
                              : "text-gray-700"
                      }
                    >
                      {result.grade}
                    </span>
                  </td>
                  <td className="py-3">{result.term}</td>
                  <td className="py-3">{result.session}</td>
                  <td className="py-3 flex gap-2">
                    <button
                      onClick={() => handleEdit(result)}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(result.id)}
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
