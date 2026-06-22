"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getStudents } from "@/lib/students";
import {
  getStudentResultsByTermAndSession,
  getClassRanking,
  getOrdinal,
} from "@/lib/results";
import { getSettings } from "@/lib/settings";
import { generateResultPDF } from "@/lib/generatePDF";

const TERMS = ["1st Term", "2nd Term", "3rd Term"];

export default function ResultSheetPage() {
  const [studentId, setStudentId] = useState("");
  const [term, setTerm] = useState("1st Term");
  const [session, setSession] = useState("2024/2025");
  const [searched, setSearched] = useState(false);

  const { data: students = [] } = useQuery({
    queryKey: ["students"],
    queryFn: getStudents,
  });

  const { data: settings = {} } = useQuery({
    queryKey: ["settings"],
    queryFn: getSettings,
  });

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
            className="border p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-400 bg-white"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
          >
            <option value="">Select Student</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} — {s.class}
              </option>
            ))}
          </select>

          <select
            className="border p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-400 bg-white"
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
            className="border p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-400 bg-white"
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
        <div className="bg-white rounded-xl shadow p-6" id="result-sheet">
          {/* Header */}
          <div className="text-center mb-6 border-b pb-4">
            {settings.logoUrl && (
              <img
                src={settings.logoUrl}
                alt="School Logo"
                className="h-16 object-contain mx-auto mb-3"
              />
            )}
            <h1 className="text-2xl font-bold uppercase">
              {settings.schoolName || "Student Result Sheet"}
            </h1>
            {settings.schoolAddress && (
              <p className="text-gray-500 text-sm mt-1">
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
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 text-sm text-center">
              <div>
                <p className="text-gray-500">Student Name</p>
                <p className="font-semibold">{selectedStudent.name}</p>
              </div>
              <div>
                <p className="text-gray-500">Matric No.</p>
                <p className="font-semibold font-mono">
                  {selectedStudent.matricNumber}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Class</p>
                <p className="font-semibold">{selectedStudent.class}</p>
              </div>
              <div>
                <p className="text-gray-500">Gender</p>
                <p className="font-semibold">{selectedStudent.gender}</p>
              </div>
            </div>
          )}

          {/* Results Table */}
          {isLoading ? (
            <p className="text-gray-400">Loading...</p>
          ) : results.length === 0 ? (
            <p className="text-gray-400">
              No results found for this student in {term} {session}.
            </p>
          ) : (
            <>
              <table className="w-full text-center text-sm mb-6">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="py-3 px-4 text-gray-500">#</th>
                    <th className="py-3 px-4 text-gray-500">Subject</th>
                    <th className="py-3 px-4 text-gray-500">CA (30)</th>
                    <th className="py-3 px-4 text-gray-500">Exam (70)</th>
                    <th className="py-3 px-4 text-gray-500">Total (100)</th>
                    <th className="py-3 px-4 text-gray-500">Grade</th>
                    <th className="py-3 px-4 text-gray-500">Remark</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((result, index) => (
                    <tr key={result.id} className="border-b last:border-0">
                      <td className="py-3 px-4 text-gray-400">{index + 1}</td>
                      <td className="py-3 px-4 ">{result.subjectName}</td>
                      <td className="py-3 px-4 ">{result.ca}</td>
                      <td className="py-3 px-4">{result.exam}</td>
                      <td className="py-3 px-4 font-semibold">
                        {result.score}
                      </td>
                      <td className="py-3 px-4 font-bold">
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
                      <td className="py-3 px-4 text-gray-500">
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

              {/* Summary + Position */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-t pt-4 text-sm">
                <div className="text-center">
                  <p className="text-gray-500">Total Score</p>
                  <p className="text-xl font-bold text-blue-600">
                    {totalScore}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-gray-500">Average</p>
                  <p className="text-xl font-bold text-green-600">{average}%</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-500">Overall Grade</p>
                  <p className="text-xl font-bold text-purple-600">
                    {getOverallGrade(average)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-gray-500">Position</p>
                  <p className="text-xl font-bold text-orange-500">
                    {position ? `${getOrdinal(position)} / ${classSize}` : "—"}
                  </p>
                </div>
              </div>

              {/* Print Button */}
              {/* Buttons */}
              <div className="mt-6 flex gap-3 justify-end no-print">
                <button
                  onClick={() => window.print()}
                  className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition"
                >
                  🖨️ Print
                </button>
                <button
                  onClick={handleDownloadPDF}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition"
                >
                  📄 Download PDF
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
