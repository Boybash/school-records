"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPendingResults, approveResult, rejectResult } from "@/lib/results";

export default function ApprovalsPage() {
  const queryClient = useQueryClient();

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

  return (
    <div>
      <h2 className="text-xl font-bold mb-6 uppercase text-primary">
        Result Approvals
      </h2>

      <div className="bg-primary rounded-md shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Pending Results</h3>
          <span className="bg-yellow-100 text-yellow-600 text-xs font-semibold px-3 py-1 rounded-full">
            {pending.length} pending
          </span>
        </div>

        {isLoading ? (
          <p className="text-gray-400">Loading...</p>
        ) : pending.length === 0 ? (
          <div className="text-center py-10 flex flex-col items-center">
            <img
              src="/checkbox.png"
              alt="checkbox"
              className="w-9 h-9 mb-2 bg-white rounded-full p-2"
            />
            <p className="text-gray-400">No pending results. All caught up!</p>
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/30">
                <th className="pb-3 text-gray-500">#</th>
                <th className="pb-3 text-gray-500">Student</th>
                <th className="pb-3 text-gray-500">Subject</th>
                <th className="pb-3 text-gray-500">CA</th>
                <th className="pb-3 text-gray-500">Exam</th>
                <th className="pb-3 text-gray-500">Total</th>
                <th className="pb-3 text-gray-500">Grade</th>
                <th className="pb-3 text-gray-500">Term</th>
                <th className="pb-3 text-gray-500">Session</th>
                <th className="pb-3 text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pending.map((result, index) => (
                <tr
                  key={result.id}
                  className="border-b border-white/30 last:border-0"
                >
                  <td className="py-3 text-gray-400">{index + 1}</td>
                  <td className="py-3 text-white">{result.studentName}</td>
                  <td className="py-3 text-white">{result.subjectName}</td>
                  <td className="py-3 text-white">{result.ca}</td>
                  <td className="py-3 text-white">{result.exam}</td>
                  <td className="py-3 font-semibold text-white">
                    {result.score}
                  </td>
                  <td className="py-3 font-bold text-white">
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
                  <td className="py-3 text-white">{result.term}</td>
                  <td className="py-3 text-white">{result.session}</td>
                  <td className="py-3 flex gap-2">
                    <button
                      onClick={() => approveMutation.mutate(result.id)}
                      disabled={approveMutation.isPending}
                      className="bg-green-100 text-green-600 hover:bg-green-200 px-3 py-2 rounded-md text-xs font-semibold transition cursor-pointer"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => rejectMutation.mutate(result.id)}
                      disabled={rejectMutation.isPending}
                      className="bg-red-100 text-red-500 hover:bg-red-200 px-3 py-2 rounded-md text-xs font-semibold transition cursor-pointer"
                    >
                      Reject
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
