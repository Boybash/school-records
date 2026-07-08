"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPendingResults, approveResult, rejectResult } from "@/lib/results";
import Link from "next/link";
import { TableSkeleton } from "@/components/skeleton";
import Pagination from "@/components/pagination";
import { useAuth } from "@/lib/useAuth";

export default function ApprovalsPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const { userData, role } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const { data: pending = [], isLoading } = useQuery({
    queryKey: ["pending-results"],
    queryFn: getPendingResults,
  });

  const approveMutation = useMutation({
    mutationFn: approveResult,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-results"] });
      queryClient.invalidateQueries({ queryKey: ["results"] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: rejectResult,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-results"] });
      queryClient.invalidateQueries({ queryKey: ["results"] });
    },
  });

  const filteredPendingResult = useMemo(() => {
    if (!role) return []; // Ensure auth has loaded
    let baseResults = pending;
    if (role === "teacher") {
      const rawSubjects = userData?.subjectName;
      const allowedSubjects = Array.isArray(rawSubjects)
        ? rawSubjects.map((s) => String(s).toLowerCase().trim())
        : rawSubjects
          ? [String(rawSubjects).toLowerCase().trim()]
          : [];

      baseResults = pending.filter((result) => {
        const resultSubject = result?.subjectName || "";
        return allowedSubjects.includes(
          String(resultSubject).toLowerCase().trim(),
        );
      });
    }
    if (!searchTerm.trim()) return baseResults;
    return baseResults.filter((result) =>
      result?.studentName?.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [pending, searchTerm, role, userData]);

  const totalPages = Math.ceil(filteredPendingResult.length / ITEMS_PER_PAGE);

  const paginatedPendingResults = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredPendingResult.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredPendingResult, currentPage]);

  return (
    <div className="relative">
      <h2 className="text-xl font-bold mb-6 uppercase text-primary">
        Result Approvals
      </h2>

      <div className="bg-primary rounded-md shadow p-4 sm:p-6">
        {/* Header Section with Integrated Search Input */}
        <div className="flex flex-col gap-4 mb-6 pb-4 border-b border-white/10 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">
              Pending Results
            </h3>
            {searchTerm && (
              <p className="text-xs text-gray-400 mt-0.5">
                Showing {filteredPendingResult.length} of {pending.length}{" "}
                matches
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <p className="text-sm text-gray-400">
              Showing {paginatedPendingResults.length} of{" "}
              {filteredPendingResult.length} students
            </p>
            <input
              type="text"
              placeholder="Filter by student name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-1.5 text-sm rounded-md border border-white/20 bg-white/10 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-yellow-500 transition w-full sm:w-64"
            />
            <span className="bg-yellow-500/20 text-yellow-300 text-xs font-semibold px-3 py-2 rounded-full text-center whitespace-nowrap self-start sm:self-auto">
              {filteredPendingResult.length} pending
            </span>
          </div>
        </div>

        {isLoading ? (
          <TableSkeleton rows={5} cols={6} dark={true} />
        ) : paginatedPendingResults.length === 0 ? (
          <div className="text-center py-10 flex flex-col items-center">
            <img
              src="/checkbox.png"
              alt="checkbox"
              className="w-9 h-9 mb-2 bg-white rounded-full p-2"
            />
            <p className="text-gray-400">No pending results. All caught up!</p>
          </div>
        ) : paginatedPendingResults.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-400">
              No results match your filter criteria.
            </p>
            <button
              onClick={() => setSearchTerm("")}
              className="text-xs font-medium text-yellow-400 underline mt-1 cursor-pointer"
            >
              Clear filter
            </button>
          </div>
        ) : (
          <>
            {/* 1. MOBILE RESPONSIVE CARD VIEW (Visible below md breakpoint) */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
              {paginatedPendingResults.map((result, index) => (
                <div
                  key={result.id}
                  className="border border-white/10 bg-white/5 rounded-lg p-4 flex flex-col gap-3"
                >
                  {/* Header: Item Index & Approval Actions */}
                  <div className="flex justify-between items-center border-b border-white/10 pb-2">
                    <span className="text-xs text-gray-400 font-mono">
                      #{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => approveMutation.mutate(result.id)}
                        disabled={approveMutation.isPending}
                        className="bg-green-500 text-white hover:bg-green-600 px-2.5 py-1 rounded-md text-xs font-semibold transition cursor-pointer disabled:opacity-50"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => rejectMutation.mutate(result.id)}
                        disabled={rejectMutation.isPending}
                        className="bg-red-500 text-white hover:bg-red-600 px-2.5 py-1 rounded-md text-xs font-semibold transition cursor-pointer disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </div>
                  </div>

                  {/* Student & Subject Details */}
                  <div>
                    <h4 className="text-white font-semibold text-base">
                      {result.studentName}
                    </h4>
                    <p className="text-gray-400 text-sm mt-0.5">
                      {result.subjectName}
                    </p>
                  </div>

                  {/* Score Breakdown Metrics Sub-Grid */}
                  <div className="grid grid-cols-4 gap-2 bg-black/20 p-2.5 rounded-md text-center text-xs">
                    <div>
                      <p className="text-gray-400 font-medium mb-0.5">CA</p>
                      <p className="text-white">{result.ca}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 font-medium mb-0.5">Exam</p>
                      <p className="text-white">{result.exam}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 font-medium mb-0.5">Total</p>
                      <p className="text-white font-bold">{result.score}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 font-medium mb-0.5">Grade</p>
                      <p
                        className={`font-extrabold ${
                          result.grade === "A"
                            ? "text-green-400"
                            : result.grade === "B"
                              ? "text-blue-400"
                              : result.grade === "F"
                                ? "text-red-400"
                                : "text-gray-300"
                        }`}
                      >
                        {result.grade}
                      </p>
                    </div>
                  </div>

                  {/* Context Footer Metadata */}
                  <div className="flex justify-between text-xs text-gray-400 pt-1">
                    <span>
                      Term:{" "}
                      <strong className="text-gray-200">{result.term}</strong>
                    </span>
                    <span>
                      Session:{" "}
                      <strong className="text-gray-200">
                        {result.session}
                      </strong>
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* 2. DESKTOP TABULAR VIEW (Visible from md breakpoint up) */}
            <div className="hidden md:block">
              <table className="w-full text-left text-sm table-fixed border-collapse">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="pb-3 text-gray-400 font-medium w-[4%]">#</th>
                    <th className="pb-3 text-gray-400 font-medium w-[22%]">
                      Student
                    </th>
                    <th className="pb-3 text-gray-400 font-medium w-[22%]">
                      Subject
                    </th>
                    <th className="pb-3 text-gray-400 font-medium w-[6%]">
                      CA
                    </th>
                    <th className="pb-3 text-gray-400 font-medium w-[6%]">
                      Exam
                    </th>
                    <th className="pb-3 text-gray-400 font-medium w-[7%]">
                      Total
                    </th>
                    <th className="pb-3 text-gray-400 font-medium w-[7%]">
                      Grade
                    </th>
                    <th className="pb-3 text-gray-400 font-medium w-[8%]">
                      Term
                    </th>
                    <th className="pb-3 text-gray-400 font-medium w-[10%]">
                      Session
                    </th>
                    <th className="pb-3 text-gray-400 font-medium w-[18%]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedPendingResults.map((result, index) => (
                    <tr
                      key={result.id}
                      className="border-b border-white/10 last:border-0 text-white hover:bg-white/5 transition"
                    >
                      <td className="py-3 text-gray-400">
                        {" "}
                        #{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                      </td>
                      <td className="py-3 text-white font-medium truncate pr-2">
                        {result.studentName}
                      </td>
                      <td className="py-3 text-white truncate pr-2">
                        {result.subjectName}
                      </td>
                      <td className="py-3 text-white">{result.ca}</td>
                      <td className="py-3 text-white">{result.exam}</td>
                      <td className="py-3 font-semibold text-white">
                        {result.score}
                      </td>
                      <td className="py-3 font-bold">
                        <span
                          className={
                            result.grade === "A"
                              ? "text-green-400"
                              : result.grade === "B"
                                ? "text-blue-400"
                                : result.grade === "F"
                                  ? "text-red-400"
                                  : "text-gray-300"
                          }
                        >
                          {result.grade}
                        </span>
                      </td>
                      <td className="py-3 text-white whitespace-nowrap">
                        {result.term}
                      </td>
                      <td className="py-3 text-white whitespace-nowrap">
                        {result.session}
                      </td>
                      <td className="py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => approveMutation.mutate(result.id)}
                            disabled={
                              approveMutation.isPending &&
                              approveMutation.variables === result.id
                            }
                            className="bg-green-500/20 text-green-300 hover:bg-green-500/30 px-3 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer disabled:opacity-50"
                          >
                            {approveMutation.isPending &&
                            approveMutation.variables === result.id
                              ? "Approving..."
                              : "Approve"}
                          </button>
                          <button
                            onClick={() => rejectMutation.mutate(result.id)}
                            disabled={
                              rejectMutation.isPending &&
                              rejectMutation.variables === result.id
                            }
                            className="bg-red-500/20 text-red-300 hover:bg-red-500/30 px-3 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer disabled:opacity-50"
                          >
                            {rejectMutation.isPending &&
                            rejectMutation.variables === result.id
                              ? "Rejecting..."
                              : "Reject"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>
      <Link
        href="/"
        className=" flex gap-2 items-center bg-primary-50 p-2 rounded-md absolute top-0 right-0 "
      >
        <img className="w-5 h-5" src="/arrow-l.png" alt="arrow" />
        Back
      </Link>
    </div>
  );
}
