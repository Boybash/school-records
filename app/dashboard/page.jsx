"use client";

import { useQuery } from "@tanstack/react-query";
import { getStudents } from "@/lib/students";
import { getSubjects } from "@/lib/subjects";
import { getResults } from "@/lib/results";
import { getPendingResults } from "@/lib/results";

export default function DashboardPage() {
  const { data: students = [] } = useQuery({
    queryKey: ["students"],
    queryFn: getStudents,
  });

  const { data: subjects = [] } = useQuery({
    queryKey: ["subjects"],
    queryFn: getSubjects,
  });

  const { data: results = [] } = useQuery({
    queryKey: ["results"],
    queryFn: getResults,
  });

  const { data: pendingResults = [] } = useQuery({
    queryKey: ["pending-results"],
    queryFn: getPendingResults,
  });

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
      color: "text-[#021024]",
      bg: "bg-[#021024]/50",
      icon: "/sheet.png",
    },
    {
      label: "Results Recorded",
      value: results.length,
      color: "text-purple-600",
      bg: "bg-[#021024]",
      icon: "/result.png",
    },
    {
      label: "Pending Approvals",
      value: pendingResults.length,
      color: "text-[#021024]",
      bg: "bg-[#021024]/50",
      icon: "loading.png",
    },
  ];

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6 uppercase text-[#021024]">
        Dashboard
      </h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`${stat.bg} rounded-md p-6 flex items-center gap-4`}
          >
            <img
              className="w-9 h-9 bg-white p-2 rounded-full object-contain"
              src={stat.icon}
              alt={stat.title}
            />
            <div>
              <p className="text-white font-bold text-sm">{stat.label}</p>
              <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Students */}
      <div className=" bg-[#021024] rounded-md shadow p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4 text-white">
          Recent Students
        </h3>
        {students.length === 0 ? (
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
        {results.length === 0 ? (
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
                          ? "text-green-600"
                          : result.grade === "B"
                            ? "text-blue-600"
                            : result.grade === "F"
                              ? "text-red-600"
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
    </div>
  );
}
