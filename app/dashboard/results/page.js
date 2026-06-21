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
  const { userData, role } = useAuth();
  const [studentId, setStudentId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [ca, setCa] = useState("");
  const [exam, setExam] = useState("");
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

  const visibleStudents =
    role === "teacher"
      ? students.filter((s) => userData?.classes?.includes(s.class))
      : students;

  const visibleSubjects =
    role === "teacher"
      ? subjects.filter((s) => s.id === userData?.subjectId)
      : subjects;

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
    setSubjectId(role === "teacher" ? userData?.subjectId || "" : "");
    setCa("");
    setExam("");
    setTerm("1st Term");
    setSession("2024/2025");
    setEditingResult(null);
  };

  const handleSubmit = () => {
    if (!studentId || !subjectId || !ca || !exam)
      return alert("Please fill in all fields");
    if (Number(ca) > 30) return alert("CA score cannot exceed 30 marks");
    if (Number(exam) > 70) return alert("Exam score cannot exceed 70 marks");
    if (Number(ca) < 0 || Number(exam) < 0)
      return alert("Scores cannot be negative");

    const selectedStudent = students.find((s) => s.id === studentId);
    const selectedSubject = subjects.find((s) => s.id === subjectId);

    const data = buildResultData(
      studentId,
      subjectId,
      ca,
      exam,
      term,
      session,
      selectedStudent.name,
      selectedSubject.name,
      role,
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
    setCa(result.ca);
    setExam(result.exam);
    setTerm(result.term);
    setSession(result.session);
  };

  const handleDelete = (id) => {
    deleteMutation.mutate(id);
  };

  const isPending = addMutation.isPending || updateMutation.isPending;
  const total = Number(ca || 0) + Number(exam || 0);

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Results</h2>

      {/* Add/Edit Form */}
      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">
          {editingResult ? "Edit Result" : "Enter Result"}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Student */}
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

          {/* Subject */}
          <select
            className="border p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-400"
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
            disabled={role === "teacher"}
          >
            <option value="">Select Subject</option>
            {visibleSubjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          {/* Term */}
          <select
            className="border p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-400"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
          >
            {TERMS.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>

          {/* Session */}
          <input
            type="text"
            placeholder="Session e.g 2024/2025"
            className="border p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-400"
            value={session}
            onChange={(e) => setSession(e.target.value)}
          />

          <input
            type="number"
            placeholder="CA Score (max 30)"
            className="w-full border p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-400"
            value={ca}
            onChange={(e) => setCa(e.target.value)}
            min={0}
            max={30}
          />

          <input
            type="number"
            placeholder="Exam Score (max 70)"
            className="w-full border p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-400"
            value={exam}
            onChange={(e) => setExam(e.target.value)}
            min={0}
            max={70}
          />
        </div>

        {/* Live Total Preview */}
        {(ca || exam) && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg flex items-center gap-6 text-sm">
            <span className="text-gray-500">
              CA: <span className="font-bold text-gray-800">{ca || 0}/30</span>
            </span>
            <span className="text-gray-500">
              Exam:{" "}
              <span className="font-bold text-gray-800">{exam || 0}/70</span>
            </span>
            <span className="text-gray-500">
              Total:{" "}
              <span
                className={`font-bold text-lg ${total >= 70 ? "text-green-600" : total >= 50 ? "text-blue-600" : "text-red-500"}`}
              >
                {total}/100
              </span>
            </span>
            <span className="text-gray-500">
              Grade:{" "}
              <span className="font-bold text-purple-600">
                {getGrade(total)}
              </span>
            </span>
          </div>
        )}

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
                <th className="pb-3 text-gray-500">CA</th>
                <th className="pb-3 text-gray-500">Exam</th>
                <th className="pb-3 text-gray-500">Total</th>
                <th className="pb-3 text-gray-500">Grade</th>
                <th className="pb-3 text-gray-500">Term</th>
                <th className="pb-3 text-gray-500">Session</th>
                <th className="pb-3 text-gray-500">Status</th>
                <th className="pb-3 text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {results.map((result, index) => (
                <tr key={result.id} className="border-b last:border-0">
                  <td className="py-3 text-gray-400">{index + 1}</td>
                  <td className="py-3">{result.studentName}</td>
                  <td className="py-3">{result.subjectName}</td>
                  <td className="py-3">{result.ca}</td>
                  <td className="py-3">{result.exam}</td>
                  <td className="py-3 font-semibold">{result.score}</td>
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
                  <td className="py-3">
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        result.status === "approved"
                          ? "bg-green-100 text-green-600"
                          : result.status === "rejected"
                            ? "bg-red-100 text-red-500"
                            : "bg-yellow-100 text-yellow-600"
                      }`}
                    >
                      {result.status || "Approved"}
                    </span>
                  </td>
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
