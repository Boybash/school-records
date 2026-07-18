"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getStudentsForUser } from "@/lib/students";
import {
  getStudentResultsByTermAndSession,
  getCommentsByTermAndSession,
} from "@/lib/results";
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
  const [isGenerate, setIsGenerate] = useState(false);

  const [searchTrigger, setSearchTrigger] = useState({
    term: "1st Term",
    session: "2024/2025",
  });

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
    queryFn: getStudentsForUser,
  });

  const { data: settings = {} } = useQuery({
    queryKey: ["settings"],
    queryFn: getSettings,
  });

  const { data: results = [], isLoading } = useQuery({
    queryKey: [
      "parent-result",
      studentId,
      searchTrigger.term,
      searchTrigger.session,
    ],
    queryFn: () =>
      getStudentResultsByTermAndSession(
        studentId,
        searchTrigger.term,
        searchTrigger.session,
      ),
    enabled: !!studentId && searched,
  });

  const { data: comments = null } = useQuery({
    queryKey: [
      "parent-comments",
      studentId,
      searchTrigger.term,
      searchTrigger.session,
    ],
    queryFn: () =>
      getCommentsByTermAndSession(
        studentId,
        searchTrigger.term,
        searchTrigger.session,
      ),
    enabled: !!studentId && searched,
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
    setSearchTrigger({
      term: term,
      session: session,
    });
    setSearched(true);
    setIsGenerate(true);
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
      searchTrigger.term,
      searchTrigger.session,
      totalScore,
      average,
      position,
      classSize,
      comments,
    );
  };

  const { data: ranking } = useQuery({
    queryKey: [
      "ranking",
      selectedStudent?.class,
      searchTrigger.term,
      searchTrigger.session,
    ],
    queryFn: () =>
      getClassRanking(
        selectedStudent?.class,
        searchTrigger.term,
        searchTrigger.session,
      ),
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

      {/* Navbar — Restored exactly the way you met it */}
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

      <div className="max-w-3xl mx-auto p-6 space-y-6">
        {/* Student Info */}
        {selectedStudent && (
          <div className="bg-primary rounded-md shadow p-6">
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
        <div className="bg-primary rounded-md shadow p-6">
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
            {/* <input
              type="text"
              placeholder="Session e.g 2024/2025"
              className="border p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-400 bg-white"
              value={session}
              onChange={(e) => setSession(e.target.value)}
            /> */}
            <select
              className="border p-3 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 bg-white"
              value={session}
              onChange={(e) => setSession(e.target.value)}
            >
              <option value="">Select Session</option>
              <option value="2024/2025">2024/2025</option>
              <option value="2025/2026">2025/2026</option>
              <option value="2026/2027">2026/2027</option>
              <option value="2027/2028">2027/2028</option>
              <option value="2028/2029">2028/2029</option>
            </select>
          </div>
          <button
            onClick={handleSearch}
            className="mt-4 bg-gray-100 text-primary px-6 py-3 rounded-lg cursor-pointer font-semibold transition"
          >
            {isGenerate ? "Fetching Result..." : "View Result"}
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
                {searchTrigger.term} — {searchTrigger.session} Academic Session
              </p>
            </div>

            {isLoading ? (
              <p className="text-gray-400">Loading...</p>
            ) : results.length === 0 ? (
              <p className="text-gray-400">
                No results found for {searchTrigger.term}{" "}
                {searchTrigger.session}.
              </p>
            ) : (
              <>
                {/* DESKTOP TABLE VIEW (Visible on larger screens) */}
                <div className="hidden md:block overflow-x-auto border rounded-lg">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b text-xs font-bold uppercase tracking-wider text-gray-500">
                        <th className="py-3 px-4 w-12 text-center">#</th>
                        <th className="py-3 px-4">Subject</th>
                        <th className="py-3 px-4 text-center w-20">CA</th>
                        <th className="py-3 px-4 text-center w-20">Exam</th>
                        <th className="py-3 px-4 text-center w-24">Total</th>
                        <th className="py-3 px-4 text-center w-20">Grade</th>
                        <th className="py-3 px-4">Remark</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y font-semibold text-gray-700">
                      {results.map((result, index) => (
                        <tr key={result.id} className="hover:bg-gray-50/50">
                          <td className="py-3 px-4 text-center text-gray-400 font-normal">
                            {index + 1}
                          </td>
                          <td className="py-3 px-4 font-bold text-gray-900">
                            {result.subjectName}
                          </td>
                          <td className="py-3 px-4 text-center text-gray-500">
                            {result.ca ?? "-"}
                          </td>
                          <td className="py-3 px-4 text-center text-gray-500">
                            {result.exam ?? "-"}
                          </td>
                          <td className="py-3 px-4 text-center text-primary font-bold">
                            {result.score}
                          </td>
                          <td className="py-3 px-4 text-center font-black">
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
                          <td className="py-3 px-4 text-xs font-bold uppercase text-gray-500">
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

                {/* MOBILE CARD LAYOUT (Visible only on small screens) */}
                <div className="block md:hidden space-y-3">
                  {results.map((result) => (
                    <div
                      key={result.id}
                      className="border rounded-lg p-4 bg-gray-50/50 flex flex-col gap-2"
                    >
                      <div className="flex justify-between items-start border-b pb-2">
                        <span className="text-sm font-bold text-gray-900">
                          {result.subjectName}
                        </span>
                        <span
                          className={`text-sm font-black px-2 py-0.5 rounded ${
                            result.grade === "A"
                              ? "bg-green-50 text-green-700"
                              : result.grade === "B"
                                ? "bg-blue-50 text-blue-700"
                                : result.grade === "F"
                                  ? "bg-red-50 text-red-700"
                                  : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {result.grade}
                        </span>
                      </div>
                      <div className="grid grid-cols-4 gap-2 text-center pt-1">
                        <div>
                          <p className="text-[10px] uppercase font-bold text-gray-400">
                            CA
                          </p>
                          <p className="text-xs font-bold text-gray-600 mt-0.5">
                            {result.ca ?? "-"}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase font-bold text-gray-400">
                            Exam
                          </p>
                          <p className="text-xs font-bold text-gray-600 mt-0.5">
                            {result.exam ?? "-"}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase font-bold text-gray-400">
                            Total
                          </p>
                          <p className="text-xs font-black text-primary mt-0.5">
                            {result.score}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase font-bold text-gray-400 text-center">
                            Remark
                          </p>
                          <p className="text-[11px] font-bold uppercase mt-0.5 text-center text-gray-500 truncate">
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
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Summary Box */}
                <div className="grid grid-cols-3 gap-4 border-t pt-4 mt-6 text-sm font-semibold">
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

                {/* Remarks Summary */}
                <div className="mt-8 border-t pt-6 space-y-4">
                  <h4 className="text-base font-bold text-gray-700 uppercase tracking-wide">
                    Remarks Summary
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-xs font-bold text-gray-400 uppercase">
                        Teacher's Comment
                      </p>
                      <p className="mt-2 text-sm text-gray-800 italic">
                        {comments?.teacherComment || "No comment uploaded yet."}
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-xs font-bold text-gray-400 uppercase">
                        Principal's Comment
                      </p>
                      <p className="mt-2 text-sm text-gray-800 italic">
                        {comments?.principalComment ||
                          "No comment uploaded yet."}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Print Controls */}
                <div className="mt-6 flex flex-col md:flex-row gap-3 justify-end no-print">
                  <button
                    onClick={() => window.print()}
                    className="flex items-center justify-center gap-2 bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition cursor-pointer font-medium text-sm w-full md:w-auto"
                  >
                    <img
                      className="w-5 h-5 object-contain"
                      src="/print.png"
                      alt="print"
                    />
                    <span>Print</span>
                  </button>

                  <button
                    onClick={handleDownloadPDF}
                    className="flex items-center justify-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition cursor-pointer font-medium text-sm w-full md:w-auto"
                  >
                    <img
                      className="w-5 h-5 object-contain"
                      src="/sheet.png"
                      alt="sheet"
                    />
                    <span>Download PDF</span>
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
