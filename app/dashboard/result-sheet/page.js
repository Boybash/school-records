"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getStudentsForUser } from "@/lib/students";
import {
  getStudentResultsByTermAndSession,
  getClassRanking,
  getOrdinal,
} from "@/lib/results";
import { getSettings } from "@/lib/settings";
import { generateResultPDF } from "@/lib/generatePDF";
import { useAuth } from "@/lib/useAuth";

const TERMS = ["1st Term", "2nd Term", "3rd Term"];

export default function ResultSheetPage() {
  const [studentId, setStudentId] = useState("");
  const [term, setTerm] = useState("1st Term");
  const [session, setSession] = useState("2024/2025");
  const [searched, setSearched] = useState(false);
  const { userData, role } = useAuth();

  const { data: students = [] } = useQuery({
    queryKey: ["students"],
    queryFn: getStudentsForUser,
  });

  const { data: settings = {} } = useQuery({
    queryKey: ["settings"],
    queryFn: getSettings,
  });

  const visibleStudents =
    role === "teacher"
      ? students.filter((s) => userData?.classes?.includes(s.class))
      : students;

  const {
    data: results = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["result-sheet", studentId, term, session],
    queryFn: () => getStudentResultsByTermAndSession(studentId, term, session),
    enabled: false,
  });

  const selectedStudent = students.find((s) => s.id === studentId);

  const { data: ranking } = useQuery({
    queryKey: ["ranking", selectedStudent?.class, term, session],
    queryFn: () => getClassRanking(selectedStudent?.class, term, session),
    enabled: !!selectedStudent && searched,
  });

  const handleSearch = () => {
    if (!studentId) return alert("Please select a student");
    if (role === "teacher" && selectedStudent) {
      const isAuthorized = userData?.classes?.includes(selectedStudent.class);
      if (!isAuthorized) {
        return alert(
          "Unauthorized: You can only query documents matching your assigned classes.",
        );
      }
    }
    setSearched(true);
    refetch();
  };

  const totalScore = results.reduce((sum, r) => sum + r.score, 0);
  const average =
    results.length > 0 ? (totalScore / results.length).toFixed(1) : 0;
  const position = ranking?.positions?.[studentId];
  const classSize = ranking?.total;

  const getOverallGrade = (avg) => {
    if (avg >= 70) return "A";
    if (avg >= 60) return "B";
    if (avg >= 50) return "C";
    if (avg >= 45) return "D";
    if (avg >= 40) return "E";
    return "F";
  };

  const handleDownloadPDF = () => {
    generateResultPDF(
      settings,
      selectedStudent,
      results,
      term,
      session,
      totalScore,
      average,
      position,
      classSize,
    );
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-6 uppercase">Result Sheet</h2>

      {/* Search Form */}
      <div className="bg-primary rounded-md shadow p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4 text-white">
          Select Student
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <select
            className="border p-3 rounded-lg outline-none focus:ring-2 focus:ring-primary-50 bg-white"
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
            className="border p-3 rounded-lg outline-none focus:ring-2 focus:ring-primary-50 bg-white"
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
            className="border p-3 rounded-lg outline-none focus:ring-2 focus:ring-primary-50 bg-white"
            value={session}
            onChange={(e) => setSession(e.target.value)}
          />
        </div>
        <button
          onClick={handleSearch}
          className="mt-4 bg-gray-100 text-primary px-6 py-3 font-semibold rounded-md  transition cursor-pointer"
        >
          Generate Result Sheet
        </button>
      </div>

      {/* Result Sheet */}
      {searched && (
        <div
          className="bg-white rounded-md shadow p-4 sm:p-6"
          id="result-sheet"
        >
          {/* Header */}
          <div className="text-center mb-6 border-b pb-4">
            {settings.logoUrl && (
              <img
                src={settings.logoUrl}
                alt="School Logo"
                className="h-16 object-contain mx-auto mb-3"
              />
            )}
            <h1 className="text-xl sm:text-2xl font-bold uppercase px-2">
              {settings.schoolName || "Student Result Sheet"}
            </h1>
            {settings.schoolAddress && (
              <p className="text-gray-500 text-sm mt-1 px-4 max-w-xl mx-auto">
                {settings.schoolAddress}
              </p>
            )}
            {settings.schoolPhone && (
              <p className="text-gray-500 text-sm">{settings.schoolPhone}</p>
            )}
            <p className="text-gray-400 text-sm mt-2">
              {term} — {session} Academic Session
            </p>
          </div>

          {/* Student Info */}
          {selectedStudent && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 text-sm text-center bg-gray-50/50 p-3 rounded-lg border border-gray-100">
              <div>
                <p className="text-gray-500 text-xs">Student Name</p>
                <p className="font-semibold text-gray-800 break-words">
                  {selectedStudent.name}
                </p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">Matric No.</p>
                <p className="font-semibold font-mono text-gray-800 break-words">
                  {selectedStudent.matricNumber}
                </p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">Class</p>
                <p className="font-semibold text-gray-800">
                  {selectedStudent.class}
                </p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">Gender</p>
                <p className="font-semibold text-gray-800">
                  {selectedStudent.gender}
                </p>
              </div>
            </div>
          )}

          {/* Results Data Section */}
          {isLoading ? (
            <p className="text-gray-400 text-center py-6">Loading...</p>
          ) : results.length === 0 ? (
            <p className="text-gray-400 text-center py-6">
              No results found for this student in {term} {session}.
            </p>
          ) : (
            <>
              {/* 1. MOBILE CARDS VIEW (Visible below md screens, hidden during printing) */}
              <div className="grid grid-cols-1 gap-4 md:hidden mb-6 print:hidden">
                {results.map((result, index) => (
                  <div
                    key={result.id}
                    className="border rounded-lg p-4 bg-white shadow-sm flex flex-col gap-2"
                  >
                    <div className="flex justify-between items-center border-b pb-2">
                      <span className="text-xs font-mono text-gray-400">
                        #{index + 1}
                      </span>
                      <span className="font-bold text-sm text-gray-800">
                        {result.subjectName}
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-1 text-center text-xs pt-1">
                      <div>
                        <p className="text-gray-400 mb-0.5">CA</p>
                        <p className="font-medium text-gray-800">
                          {result.ca}/30
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400 mb-0.5">Exam</p>
                        <p className="font-medium text-gray-800">
                          {result.exam}/70
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400 mb-0.5">Total</p>
                        <p className="font-bold text-gray-900">
                          {result.score}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400 mb-0.5">Grade</p>
                        <p
                          className={`font-extrabold ${
                            result.grade === "A"
                              ? "text-green-600"
                              : result.grade === "B"
                                ? "text-blue-600"
                                : result.grade === "F"
                                  ? "text-red-600"
                                  : "text-gray-700"
                          }`}
                        >
                          {result.grade}
                        </p>
                      </div>
                    </div>

                    <div className="text-right text-xs text-gray-500 pt-1 border-t border-dashed">
                      Remark:{" "}
                      <span className="font-medium text-gray-700">
                        {result.grade === "A"
                          ? "Excellent"
                          : result.grade === "B"
                            ? "Very Good"
                            : result.grade === "C"
                              ? "Good"
                              : result.grade === "D"
                                ? "Pass"
                                : result.grade === "E"
                                  ? "Poor"
                                  : "Fail"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* 2. DESKTOP TABULAR VIEW (Hidden on mobile devices, forces display when printing) */}
              <div className="hidden md:block print:block mb-6 overflow-x-auto">
                <table className="w-full text-center text-sm border-collapse min-w-[600px] print:min-w-0">
                  <thead>
                    <tr className="bg-gray-50 border-b">
                      <th className="py-3 px-2 text-gray-500 w-[5%]">#</th>
                      <th className="py-3 px-4 text-gray-500 text-left w-[35%]">
                        Subject
                      </th>
                      <th className="py-3 px-2 text-gray-500 w-[12%]">
                        CA (30)
                      </th>
                      <th className="py-3 px-2 text-gray-500 w-[12%]">
                        Exam (70)
                      </th>
                      <th className="py-3 px-2 text-gray-500 w-[14%]">
                        Total (100)
                      </th>
                      <th className="py-3 px-2 text-gray-500 w-[10%]">Grade</th>
                      <th className="py-3 px-2 text-gray-500 w-[12%]">
                        Remark
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((result, index) => (
                      <tr
                        key={result.id}
                        className="border-b last:border-0 hover:bg-gray-50/50 transition"
                      >
                        <td className="py-3 px-2 text-gray-400">{index + 1}</td>
                        <td className="py-3 px-4 text-left font-medium text-gray-800">
                          {result.subjectName}
                        </td>
                        <td className="py-3 px-2 text-gray-700">{result.ca}</td>
                        <td className="py-3 px-2 text-gray-700">
                          {result.exam}
                        </td>
                        <td className="py-3 px-2 font-semibold text-gray-900">
                          {result.score}
                        </td>
                        <td className="py-3 px-2 font-bold">
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
                        <td className="py-3 px-2 text-gray-500">
                          {result.grade === "A"
                            ? "Excellent"
                            : result.grade === "B"
                              ? "Very Good"
                              : result.grade === "C"
                                ? "Good"
                                : result.grade === "D"
                                  ? "Pass"
                                  : result.grade === "E"
                                    ? "Poor"
                                    : "Fail"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary Metrics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-t pt-6 text-sm">
                <div className="text-center bg-blue-50/30 p-2 rounded-lg border border-blue-100/40">
                  <p className="text-gray-500 text-xs">Total Score</p>
                  <p className="text-xl font-bold text-blue-600 mt-0.5">
                    {totalScore}
                  </p>
                </div>
                <div className="text-center bg-green-50/30 p-2 rounded-lg border border-green-100/40">
                  <p className="text-gray-500 text-xs">Average</p>
                  <p className="text-xl font-bold text-green-600 mt-0.5">
                    {average}%
                  </p>
                </div>
                <div className="text-center bg-purple-50/30 p-2 rounded-lg border border-purple-100/40">
                  <p className="text-gray-500 text-xs">Overall Grade</p>
                  <p className="text-xl font-bold text-purple-600 mt-0.5">
                    {getOverallGrade(average)}
                  </p>
                </div>
                <div className="text-center bg-orange-50/30 p-2 rounded-lg border border-orange-100/40">
                  <p className="text-gray-500 text-xs">Position</p>
                  <p className="text-xl font-bold text-orange-500 mt-0.5">
                    {position ? `${getOrdinal(position)} / ${classSize}` : "—"}
                  </p>
                </div>
              </div>

              {/* Control Action Buttons */}
              <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-end no-print">
                <button
                  onClick={() => window.print()}
                  className="w-full sm:w-auto bg-gray-600 text-white px-6 py-2.5 sm:py-3 rounded-lg hover:bg-gray-700 transition font-medium text-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>🖨️</span> Print Sheet
                </button>
                <button
                  onClick={handleDownloadPDF}
                  className="w-full sm:w-auto bg-green-600 text-white px-6 py-2.5 sm:py-3 rounded-lg hover:bg-green-700 transition font-medium text-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>📄</span> Download PDF
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
