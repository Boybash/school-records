"use client";

import { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getAlumni } from "@/lib/alumni";
import Pagination from "@/components/pagination";
import { TableSkeleton } from "@/components/skeleton";

export default function AlumniPage() {
  const queryClient = useQueryClient();

  // 1. Fetch Alumni Data
  const { data: alumni = [], isLoading } = useQuery({
    queryKey: ["alumni"],
    queryFn: getAlumni,
  });

  // 2. Filter, Search, and Pagination States
  const [search, setSearch] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedDept, setSelectedDept] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // 3. Dynamically Extract Unique Filter Options from Data
  const graduationYears = useMemo(() => {
    const years = alumni
      .map((item) => item.graduationYear || item.year)
      .filter(Boolean);
    return [...new Set(years)].sort((a, b) => b - a); // Newest years first
  }, [alumni]);

  const departments = useMemo(() => {
    const depts = alumni
      .map((item) => item.department || item.field)
      .filter(Boolean);
    return [...new Set(depts)].sort();
  }, [alumni]);

  // 4. Combined Filtering & Search Logic
  const filteredAlumni = useMemo(() => {
    return alumni.filter((person) => {
      const searchLower = search.toLowerCase();

      const matchesSearch =
        !search ||
        person.name?.toLowerCase().includes(searchLower) ||
        person.email?.toLowerCase().includes(searchLower) ||
        person.company?.toLowerCase().includes(searchLower) ||
        person.jobTitle?.toLowerCase().includes(searchLower);

      const personYear = person.graduationYear || person.year;
      const matchesYear = !selectedYear || String(personYear) === selectedYear;

      const personDept = person.department || person.field;
      const matchesDept = !selectedDept || personDept === selectedDept;

      return matchesSearch && matchesYear && matchesDept;
    });
  }, [alumni, search, selectedYear, selectedDept]);

  // 5. Pagination Math
  const totalPages = Math.ceil(filteredAlumni.length / ITEMS_PER_PAGE);

  const paginatedAlumni = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAlumni.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredAlumni, currentPage]);

  // Helper: Reset all filters
  const handleClearFilters = () => {
    setSearch("");
    setSelectedYear("");
    setSelectedDept("");
    setCurrentPage(1);
  };

  return (
    <div className="">
      <h2 className="text-xl font-bold mb-6 uppercase text-primary">
        Alumni Records
      </h2>

      {/* Filter and Search Bar Card */}
      <div className="bg-[#021024] border border-white/10 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4 text-white">
          Search & Filters
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Text Search input */}
          <input
            type="text"
            placeholder="Search by name..."
            className="border border-white/10 p-3 rounded-lg outline-none focus:ring-2 focus:ring-primary bg-white text-gray-900"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1); // Reset page on filter changes
            }}
          />

          {/* Filter Graduation Year */}
          <select
            className="border border-white/10 p-3 rounded-lg outline-none focus:ring-2 focus:ring-primary bg-white text-gray-900"
            value={selectedYear}
            onChange={(e) => {
              setSelectedYear(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">All Graduation Years</option>
            {graduationYears.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>

          {/* Filter Department */}
          <select
            className="border border-white/10 p-3 rounded-lg outline-none focus:ring-2 focus:ring-primary bg-white text-gray-900"
            value={selectedDept}
            onChange={(e) => {
              setSelectedDept(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">All Departments</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>

        {/* Clear Filters Button */}
        {(search || selectedYear || selectedDept) && (
          <button
            onClick={handleClearFilters}
            className="mt-3 text-sm text-red-500 hover:text-red-400 font-medium transition duration-150 ease-in-out cursor-pointer"
          >
            Clear active filters
          </button>
        )}
      </div>

      {/* Directory Content Area */}
      <div className="bg-[#021024] border border-white/10 rounded-lg p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-6">
          <h3 className="text-lg font-semibold text-white">Alumni Records</h3>
          <p className="text-sm text-gray-400">
            Showing {paginatedAlumni.length} of {filteredAlumni.length} results
          </p>
        </div>

        {isLoading ? (
          <TableSkeleton rows={5} cols={5} dark={true} />
        ) : paginatedAlumni.length === 0 ? (
          <p className="text-gray-400 py-4">No matching alumni found.</p>
        ) : (
          <>
            {/* 1. Mobile Adaptive Card view (Below md break-point) */}
            <div className="grid grid-cols-1 gap-4 md:hidden mb-6">
              {paginatedAlumni.map((person, index) => (
                <div
                  key={person.id || index}
                  className="border border-white/10 bg-white/5 rounded-lg p-4 flex flex-col gap-2"
                >
                  <div className="flex justify-between items-start border-b border-white/10 pb-2">
                    <h4 className="font-semibold text-white text-base">
                      {person.name}
                    </h4>
                    <span className="text-xs bg-blue-500/20 text-blue-300 font-medium px-2 py-0.5 rounded-full">
                      Class of {person.graduationYear || person.year}
                    </span>
                  </div>
                  <div className="text-sm space-y-1">
                    <p className="text-gray-300">
                      <span className="text-gray-500">Dept:</span>{" "}
                      {person.department || person.field || "N/A"}
                    </p>
                    <p className="text-gray-300">
                      <span className="text-gray-500">Email:</span>{" "}
                      {person.email || "N/A"}
                    </p>
                    {person.jobTitle && (
                      <p className="text-gray-300">
                        <span className="text-gray-500">Role:</span>{" "}
                        {person.jobTitle}{" "}
                        {person.company ? `@ ${person.company}` : ""}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* 2. Desktop Tabular View (md screens and up) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-sm table-fixed border-collapse">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="pb-3 text-gray-400 font-medium w-[25%]">
                      Name
                    </th>
                    <th className="pb-3 text-gray-400 font-medium w-[15%]">
                      Graduation Year
                    </th>
                    <th className="pb-3 text-gray-400 font-medium w-[20%]">
                      Department
                    </th>
                    <th className="pb-3 text-gray-400 font-medium w-[20%]">
                      Email Address
                    </th>
                    <th className="pb-3 text-gray-400 font-medium w-[20%]">
                      Current Employment
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedAlumni.map((person, index) => (
                    <tr
                      key={person.id || index}
                      className="border-b border-white/10 last:border-0 text-white hover:bg-white/5 transition duration-150"
                    >
                      <td className="py-3 pr-2 font-medium truncate">
                        {person.name}
                      </td>
                      <td className="py-3 text-gray-300">
                        {person.graduationYear || person.year}
                      </td>
                      <td className="py-3 text-gray-300 truncate pr-2">
                        {person.department || person.field || "—"}
                      </td>
                      <td className="py-3 text-gray-300 truncate pr-2">
                        {person.email || "—"}
                      </td>
                      <td className="py-3 text-gray-300 truncate">
                        {person.jobTitle ? (
                          <span>
                            {person.jobTitle}
                            {person.company ? ` at ${person.company}` : ""}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="mt-6">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
