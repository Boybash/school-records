"use client";

import { useQuery } from "@tanstack/react-query";
import { getStudents } from "@/lib/students";
import { getSubjects } from "@/lib/subjects";
import { getResults, getPendingResults } from "@/lib/results";
import Link from "next/link";
import { CardSkeleton, TableSkeleton } from "@/components/skeleton";

export default function DashboardPage() {
  const { data: students = [], isLoading: loadingStudents } = useQuery({
    queryKey: ["students"],
    queryFn: getStudents,
  });

  const { data: subjects = [], isLoading: loadingSubjects } = useQuery({
    queryKey: ["subjects"],
    queryFn: getSubjects,
  });

  const { data: results = [], isLoading: loadingResults } = useQuery({
    queryKey: ["results"],
    queryFn: getResults,
  });

  const { data: pendingResults = [], isLoading: loadingPending } = useQuery({
    queryKey: ["pending-results"],
    queryFn: getPendingResults,
  });

  const statsLoading =
    loadingStudents || loadingSubjects || loadingResults || loadingPending;

  const stats = [
    {
      label: "Total Students",
      value: students.length,
      color: "text-blue-600",
      bg: "bg-[#021024]",
      icon: "/graduation-cap.png",
    },
    {
      label: "Total Subjects",
      value: subjects.length,
      color: "text-white",
      bg: "bg-[#021024]/50",
      icon: "/sheet.png",
    },
    {
      label: "Results Recorded",
      value: results.length,
      color: "text-purple-400",
      bg: "bg-[#021024]",
      icon: "/result.png",
    },
    {
      label: "Pending Approvals",
      value: pendingResults.length,
      color: "text-yellow-400",
      bg: "bg-[#021024]/50",
      icon: "/loading.png",
    },
  ];

  return (
    <div className="relative">
      <h2 className="text-2xl font-semibold mb-6 uppercase text-[#021024]">
        Dashboard
      </h2>

      {/* Stats Cards */}
      {statsLoading ? (
        <CardSkeleton count={4} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className={`${stat.bg} rounded-md p-6 flex items-center gap-4`}
            >
              <img
                className="w-9 h-9 bg-white p-2 rounded-full object-contain"
                src={stat.icon}
                alt={stat.label}
              />
              <div>
                <p className="text-white font-bold text-sm">{stat.label}</p>
                <p className={`text-3xl font-bold ${stat.color}`}>
                  {stat.value}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Recent Students */}
      <div className="bg-[#021024] rounded-md shadow p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4 text-white">
          Recent Students
        </h3>
        {loadingStudents ? (
          <TableSkeleton rows={5} cols={3} dark={true} />
        ) : students.length === 0 ? (
          <p className="text-gray-400 text-sm">No students added yet.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/30">
                <th className="pb-3 text-gray-500">Name</th>
                <th className="pb-3 text-gray-500">Class</th>
                <th className="pb-3 text-gray-500">Gender</th>
              </tr>
            </thead>
            <tbody>
              {students.slice(0, 5).map((student) => (
                <tr
                  key={student.id}
                  className="border-b border-white/30 last:border-0 text-white"
                >
                  <td className="py-3">{student.name}</td>
                  <td className="py-3">{student.class}</td>
                  <td className="py-3">{student.gender}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Recent Results */}
      <div className="bg-[#021024] rounded-md shadow p-6">
        <h3 className="text-lg font-semibold mb-4 text-white">
          Recent Results
        </h3>
        {loadingResults ? (
          <TableSkeleton rows={5} cols={5} dark={true} />
        ) : results.length === 0 ? (
          <p className="text-gray-400 text-sm">No results recorded yet.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/30">
                <th className="pb-3 text-gray-500">Student</th>
                <th className="pb-3 text-gray-500">Subject</th>
                <th className="pb-3 text-gray-500">Score</th>
                <th className="pb-3 text-gray-500">Grade</th>
                <th className="pb-3 text-gray-500">Term</th>
              </tr>
            </thead>
            <tbody>
              {results.slice(0, 5).map((result) => (
                <tr
                  key={result.id}
                  className="border-b border-white/30 last:border-0 text-white"
                >
                  <td className="py-3">{result.studentName}</td>
                  <td className="py-3">{result.subjectName}</td>
                  <td className="py-3">{result.score}</td>
                  <td className="py-3 font-bold">
                    <span
                      className={
                        result.grade === "A"
                          ? "text-green-400"
                          : result.grade === "B"
                            ? "text-blue-400"
                            : result.grade === "F"
                              ? "text-red-400"
                              : "text-gray-500"
                      }
                    >
                      {result.grade}
                    </span>
                  </td>
                  <td className="py-3">{result.term}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Link
        href="/"
        className="flex gap-2 items-center bg-primary-50 p-2 rounded-md absolute top-0 right-0"
      >
        <img className="w-5 h-5" src="/arrow-l.png" alt="arrow" />
        Back
      </Link>
    </div>
  );
}
