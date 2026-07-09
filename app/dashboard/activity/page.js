"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchSystemLogs } from "@/lib/activity"; // Import the fetch function from lib/activity.js
import Pagination from "@/components/pagination";

const ACTION_TYPES = [
  { value: "ALL", label: "All Activities" },
  { value: "RESULT_APPROVAL", label: "Approvals" },
  { value: "RESULT_REJECTION", label: "Rejections" },
  { value: "RESULT_UPDATE", label: "Modifications" },
  { value: "RESULT_DELETION", label: "Deletions" },
];

export default function AdminLogDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAction, setFilterAction] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // React Query fetch
  const {
    data: logs = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["logs"],
    queryFn: fetchSystemLogs,
  });

  // Get Action-specific styling badges
  const getBadgeStyle = (action) => {
    switch (action) {
      case "RESULT_APPROVAL":
        return "bg-green-50 text-green-700 border-green-200";
      case "RESULT_REJECTION":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "RESULT_UPDATE":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "RESULT_DELETION":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const formatActionName = (action) => action.replace("RESULT_", "");

  // Format timestamp nicely
  const formatTime = (isoString) => {
    if (!isoString) return "-";
    const date = new Date(isoString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Client-side Filter Logic
  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.userName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterAction === "ALL" || log.action === filterAction;
    return matchesSearch && matchesFilter;
  });

  // Pagination bounds
  const totalPages = Math.ceil(filteredLogs.length / ITEMS_PER_PAGE);
  const paginatedActivity = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredLogs.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredLogs, currentPage]);

  return (
    <div>
      <h1 className="text-xl font-bold mb-6 uppercase">School Activity Logs</h1>
      <div className="min-h-screen bg-primary p-4 sm:p-8 text-gray-800 rounded-md">
        <div className="max-w-6xl mx-auto space-y-6 ">
          {/* Header and Refresh Button */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
            <div>
              <p className="text-sm text-gray-500 mt-0.5">
                Monitor grade updates, form configurations, and deletion events.
              </p>
            </div>
            <button
              onClick={() => refetch()}
              className="w-full sm:w-auto px-4 py-2 text-sm font-semibold bg-white cursor-pointer border rounded-md hover:bg-gray-50 shadow-sm transition flex items-center justify-center gap-2 text-gray-700"
            >
              <img
                className="w-5 h-5 object-contain "
                src="/refresh.png"
                alt="refresh"
              />
              Refresh Records
            </button>
          </div>

          {/* Search and Filters Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-4 rounded-md border shadow-sm">
            <div className="sm:col-span-2 relative">
              <input
                type="text"
                placeholder="Search logs by staff member or keyword..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full p-2.5 text-sm border rounded-md outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <div>
              <select
                value={filterAction}
                onChange={(e) => {
                  setFilterAction(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full p-2.5 text-sm border rounded-md outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white font-medium text-gray-700"
              >
                {ACTION_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Loading and Empty States */}
          {isLoading ? (
            <div className="py-24 text-center text-sm text-gray-400 font-medium animate-pulse">
              Loading core metrics audit stream...
            </div>
          ) : paginatedActivity.length === 0 ? (
            <div className="py-16 text-center border-2 border-dashed rounded-xl bg-white">
              <p className="text-sm font-medium text-gray-400">
                No matching log records found in this context.
              </p>
            </div>
          ) : (
            <>
              {/* DESKTOP AUDIT TABLE CONTAINER */}
              <div className="hidden md:block overflow-hidden bg-white rounded-md border shadow-sm">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b text-xs font-bold uppercase tracking-wider text-gray-400">
                      <th className="py-3 px-4 w-40">Timestamp</th>
                      <th className="py-3 px-4 w-36">Action Event</th>
                      <th className="py-3 px-4">Audit Description</th>
                      <th className="py-3 px-4 w-44">Performed By</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-primary text-gray-700 font-medium">
                    {paginatedActivity.map((log, index) => (
                      <tr
                        key={log.id}
                        className="hover:bg-gray-50/50 transition"
                      >
                        <td className="py-4 px-4 text-xs font-mono text-gray-500 whitespace-nowrap">
                          {formatTime(log.timestamp)}
                        </td>
                        <td className="py-4 px-4">
                          <span
                            className={`inline-block border px-2 py-0.5 rounded text-[11px] font-bold uppercase ${getBadgeStyle(log.action)}`}
                          >
                            {formatActionName(log.action)}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-gray-900 pr-6 break-words leading-relaxed">
                          {log.description}
                        </td>
                        <td className="py-4 px-4 whitespace-nowrap">
                          <div className="text-gray-900 font-bold">
                            {log.userName}
                          </div>
                          <div className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mt-0.5">
                            {log.userRole}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* MOBILE AUDIT FEED (Shown on smaller devices) */}
              <div className="block md:hidden space-y-3">
                {paginatedActivity.map((log) => (
                  <div
                    key={log.id}
                    className="bg-white p-4 border rounded-xl shadow-sm space-y-3"
                  >
                    <div className="flex justify-between items-center border-b pb-2">
                      <span
                        className={`inline-block border px-2 py-0.5 rounded text-[10px] font-bold uppercase ${getBadgeStyle(log.action)}`}
                      >
                        {formatActionName(log.action)}
                      </span>
                      <span className="text-[11px] font-mono text-gray-400">
                        {formatTime(log.timestamp)}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-gray-900 leading-relaxed">
                      {log.description}
                    </p>
                    <div className="pt-1 flex justify-between items-center text-xs">
                      <span className="text-gray-400 font-medium">
                        User Context:
                      </span>
                      <span className="font-bold text-gray-700">
                        {log.userName}{" "}
                        <span className="text-[10px] font-normal uppercase text-gray-400">
                          ({log.userRole})
                        </span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination controls footer */}
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
