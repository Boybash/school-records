"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getStudents } from "@/lib/students";
import { getStudentResultsByTermAndSession } from "@/lib/results";
import { getSettings } from "@/lib/settings";
import { generateResultPDF } from "@/lib/generatePDF";
import { getClassRanking } from "@/lib/results";
import { useSessionTimeout } from "@/lib/useSessionTimeout";
import SessionWarning from "@/components/sessionWarning";

const TERMS = ["1st Term", "2nd Term", "3rd Term"];

export default function ParentResultPage() {
  const router = useRouter();
  const [studentId, setStudentId] = useState(null);
  const [term, setTerm] = useState("1st Term");
  const [session, setSession] = useState("2024/2025");
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    const getSession = async () => {
      const response = await fetch("/api/parent-session");
      if (!response.ok) {
        router.push("/parent/login");
        return;
      }
      const data = await response.json();
      if (!data.studentId) {
        router.push("/parent/login");
        return;
      }
      setStudentId(data.studentId);
    };
    getSession();
  }, [router]);

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
    queryKey: ["parent-result", studentId, term, session],
    queryFn: () => getStudentResultsByTermAndSession(studentId, term, session),
    enabled: false,
  });

  const selectedStudent = students.find((s) => s.id === studentId);
  const totalScore = results.reduce((sum, r) => sum + r.score, 0);
  const average =
    results.length > 0 ? (totalScore / results.length).toFixed(1) : 0;

  const getOverallGrade = (avg) => {
    if (avg >= 70) return "A";
    if (avg >= 60) return "B";
    if (avg >= 50) return "C";
    if (avg >= 45) return "D";
    if (avg >= 40) return "E";
    return "F";
  };

  const handleSearch = () => {
    setSearched(true);
    refetch();
  };

  const handleLogout = async () => {
    await fetch("/api/parent-session", { method: "DELETE" });
    router.push("/parent/login");
  };

  const { showWarning, resetTimer } = useSessionTimeout(handleLogout);

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

  const { data: ranking } = useQuery({
    queryKey: ["ranking", selectedStudent?.class, term, session],
    queryFn: () => getClassRanking(selectedStudent?.class, term, session),
    enabled: !!selectedStudent && searched,
  });

  const position = ranking?.positions?.[studentId];
  const classSize = ranking?.total;

  if (!studentId) return null;

  return (
    <div className="min-h-screen bg-gray-100">
      {showWarning && (
        <SessionWarning onStay={resetTimer} onLogout={handleLogout} />
      )}
      {/* Navbar */}
      <nav className="bg-white shadow p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-primary uppercase">
          Parent Portal
        </h1>
        <div
          className="flex items-center gap-1 bg-primary-50 p-2 rounded-full cursor-pointer"
          onClick={handleLogout}
        >
          <img
            className="w-9 h-9 bg-white p-2 rounded-full object-contain "
            src="/user-logout.png"
            alt="logout"
          />
          <button className="text-sm text-primary font-semibold ">
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto p-6">
        {/* Student Info */}
        {selectedStudent && (
          <div className="bg-primary rounded-md shadow p-6 mb-6">
            <h2 className="text-lg font-semibold mb-3 text-white">
              Student Information
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Name</p>
                <p className="font-semibold text-white">
                  {selectedStudent.name}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Matric No.</p>
                <p className="font-semibold font-mono text-white">
                  {selectedStudent.matricNumber}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Class</p>
                <p className="font-semibold text-white">
                  {selectedStudent.class}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Gender</p>
                <p className="font-semibold text-white">
                  {selectedStudent.gender}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Term & Session Selector */}
        <div className="bg-primary rounded-md shadow p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4 text-white">
            Select Term & Session
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            className="mt-4 bg-gray-100 text-primary px-6 py-3 rounded-lg cursor-pointer font-semibold transition"
          >
            View Result
          </button>
        </div>

        {/* Result Sheet */}
        {searched && (
          <div className="bg-white rounded-md shadow p-6" id="result-sheet">
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

            {isLoading ? (
              <p className="text-gray-400">Loading...</p>
            ) : results.length === 0 ? (
              <p className="text-gray-400">
                No results found for {term} {session}.
              </p>
            ) : (
              <>
                <table className="w-full text-left text-sm mb-6">
                  <thead>
                    <tr className="bg-gray-50 border-b">
                      <th className="py-3 px-4 text-gray-500">#</th>
                      <th className="py-3 px-4 text-gray-500">Subject</th>
                      <th className="py-3 px-4 text-gray-500">Score</th>
                      <th className="py-3 px-4 text-gray-500">Grade</th>
                      <th className="py-3 px-4 text-gray-500">Remark</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((result, index) => (
                      <tr
                        key={result.id}
                        className="border-b last:border-0 font-semibold"
                      >
                        <td className="py-3 px-4 text-gray-400">{index + 1}</td>
                        <td className="py-3 px-4">{result.subjectName}</td>
                        <td className="py-3 px-4">{result.score}</td>
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
                        <td className="py-3 px-4 text-gray-500 font-semibold">
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

                {/* Summary */}
                <div className="grid grid-cols-3 gap-4 border-t pt-4 text-sm font-semibold">
                  <div className="text-center">
                    <p className="text-gray-500">Total Score</p>
                    <p className="text-xl font-bold text-blue-600">
                      {totalScore}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-500">Average</p>
                    <p className="text-xl font-bold text-green-600">
                      {average}%
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-500">Overall Grade</p>
                    <p className="text-xl font-bold text-purple-600">
                      {getOverallGrade(average)}
                    </p>
                  </div>
                </div>

                {/* Print Button */}
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
    </div>
  );
}
