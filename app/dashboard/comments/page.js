"use client";

import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/useAuth";
import { getStudentsForUser } from "@/lib/students";
import { TableSkeleton } from "@/components/skeleton";
import Pagination from "@/components/pagination";
import {
  getCommentsByTermAndSession,
  saveTeacherComment,
} from "@/lib/comments";

const TERMS = ["1st Term", "2nd Term", "3rd Term"];

export default function TeacherCommentsPage() {
  const queryClient = useQueryClient();
  const { userData, role } = useAuth();
  const [selectedClass, setSelectedClass] = useState("");
  const [term, setTerm] = useState("1st Term");
  const [session, setSession] = useState("2024/2025");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  const [commentPayloads, setCommentPayloads] = useState({});

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedClass, term, session]);

  // 1. Fetch Students
  const { data: students = [], isLoading: loadingStudents } = useQuery({
    queryKey: ["students"],
    queryFn: getStudentsForUser,
  });

  // 2. Fetch Existing Comments
  const { data: existingComments = [], isLoading: loadingComments } = useQuery({
    queryKey: ["teacher-comments", term, session, selectedClass],
    queryFn: () =>
      getTeacherCommentsByTermAndSession(term, session, selectedClass),
    enabled: !!selectedClass,
  });

  const availableClasses = useMemo(() => {
    if (role === "teacher") return userData?.classes || [];
    return [...new Set(students.map((s) => s.class))].sort();
  }, [role, userData, students]);

  const filteredStudents = useMemo(() => {
    if (!selectedClass) return [];
    return students.filter((s) => s.class === selectedClass);
  }, [students, selectedClass]);

  const totalPages = Math.ceil(filteredStudents.length / ITEMS_PER_PAGE);

  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredStudents.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredStudents, currentPage]);

  const commentMutation = useMutation({
    mutationFn: saveTeacherComment,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["teacher-comments", term, session, selectedClass],
      });
      alert(`Comments successfully saved for student!`);
    },
    onError: (error) => {
      console.error("❌ FIRESTORE MUTATION ERROR:", error);
      alert(
        `Failed to update entries: ${error.message || "Permission verification denied."}`,
      );
    },
  });

  const handleFieldChange = (studentId, field, text) => {
    setCommentPayloads((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: text,
      },
    }));
  };

  const handleSaveRow = (student) => {
    const localInput = commentPayloads[student.id] || {};
    const savedRecord =
      existingComments.find((c) => c.studentId === student.id) || {};

    const payload = {
      studentId: student.id,
      class: student.class,
      term,
      session,
      teacherComment:
        localInput.teacherComment ?? savedRecord.teacherComment ?? "",
      principalComment:
        localInput.principalComment ?? savedRecord.principalComment ?? "",
    };

    commentMutation.mutate(payload);
  };

  const isLoading = loadingStudents || loadingComments;

  return (
    <div className="w-full space-y-6">
      <h2 className="text-xl font-bold uppercase tracking-wide">
        End of Term Remarks & Comments
      </h2>

      {/* Scope Filter Controls panel */}
      <div className="bg-[#021024] rounded-md shadow p-6 text-white">
        <h3 className="text-lg font-semibold mb-4">Select Scope</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-black">
          <select
            className="border p-3 rounded-lg outline-none bg-white w-full"
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
          >
            <option value="">-- Select Class --</option>
            {availableClasses.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            className="border p-3 rounded-lg outline-none bg-white w-full"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
          >
            {TERMS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Session e.g 2024/2025"
            className="border p-3 rounded-lg outline-none bg-white w-full"
            value={session}
            onChange={(e) => setSession(e.target.value)}
          />
        </div>
      </div>

      {/* Main Container Layout */}
      <div className="bg-[#021024] rounded-md shadow p-4 sm:p-6 text-white">
        {!selectedClass ? (
          <p className="text-gray-400 text-center py-8">
            Please select a class above to access student remark sheets.
          </p>
        ) : isLoading ? (
          <TableSkeleton rows={4} cols={4} dark={true} />
        ) : paginatedStudents.length === 0 ? (
          <p className="text-gray-400 text-center py-8">
            No registered students located inside class "{selectedClass}".
          </p>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-400 mb-2">
              Showing {paginatedStudents.length} of {filteredStudents.length}{" "}
              students
            </p>

            {/* Desktop Table Header Display (Hidden on Mobile) */}
            <div className="hidden md:grid md:grid-cols-12 gap-4 pb-3 border-b border-white/20 text-gray-400 font-medium text-sm px-2">
              <div className="col-span-3">Student Profile</div>
              <div className="col-span-4">Form Teacher's Comment</div>
              <div className="col-span-4">Principal's Comment</div>
              <div className="col-span-1 text-center">Action</div>
            </div>

            {/* Dynamic Card / Row Loop */}
            <div className="space-y-4 md:space-y-0 md:divide-y md:divide-white/10">
              {paginatedStudents.map((student) => {
                const dbRecord =
                  existingComments.find((c) => c.studentId === student.id) ||
                  {};
                const currentFormText =
                  commentPayloads[student.id]?.teacherComment ??
                  dbRecord.formTeacherComment ??
                  "";
                const currentPrincipalText =
                  commentPayloads[student.id]?.principalComment ??
                  dbRecord.principalComment ??
                  "";

                return (
                  <div
                    key={student.id}
                    className="bg-white/5 md:bg-transparent p-4 md:p-0 md:py-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-start rounded-lg md:rounded-none hover:bg-white/5 transition group px-2"
                  >
                    {/* Column 1: Profile Information */}
                    <div className="col-span-1 md:col-span-3">
                      <p className="font-semibold text-white group-hover:text-gray-600 transition text-base md:text-sm">
                        {student.name}
                      </p>
                      <p className="text-xs text-gray-400 font-mono mt-0.5">
                        {student.matricNumber}
                      </p>
                      <span className="inline-block mt-2 px-2 py-0.5 bg-white/10 rounded text-[10px] uppercase font-medium">
                        {student.gender}
                      </span>
                    </div>

                    {/* Column 2: Form Teacher Field */}
                    <div className="col-span-1 md:col-span-4 space-y-1">
                      <label className="block text-xs text-gray-400 font-medium md:hidden">
                        Form Teacher's Comment
                      </label>
                      <textarea
                        rows={2}
                        className="w-full p-2 rounded-md bg-white text-black text-xs outline-none focus:ring-2 focus:ring-primary-50 resize-y"
                        placeholder="e.g., An excellent academic performance."
                        value={currentFormText}
                        onChange={(e) =>
                          handleFieldChange(
                            student.id,
                            "teacherComment",
                            e.target.value,
                          )
                        }
                      />
                    </div>

                    {/* Column 3: Principal Field */}
                    <div className="col-span-1 md:col-span-4 space-y-1">
                      <label className="block text-xs text-gray-400 font-medium md:hidden">
                        Principal's Comment
                      </label>
                      <textarea
                        rows={2}
                        className="w-full p-2 rounded-md bg-white text-black text-xs outline-none focus:ring-2 focus:ring-primary-50 resize-y"
                        placeholder="e.g., Highly commendable result."
                        value={currentPrincipalText}
                        disabled={role === "teacher"}
                        onChange={(e) =>
                          handleFieldChange(
                            student.id,
                            "principalComment",
                            e.target.value,
                          )
                        }
                      />
                      {role === "teacher" && (
                        <span className="text-[10px] text-gray-500 block mt-1">
                          🔒 Read-only (Principal authority restriction)
                        </span>
                      )}
                    </div>

                    {/* Column 4: Action Button */}
                    <div className="col-span-1 md:col-span-1 pt-2 md:pt-0 h-full flex items-center justify-end md:justify-center">
                      <button
                        onClick={() => handleSaveRow(student)}
                        // Check if THIS specific student is the one actively mutating
                        disabled={
                          commentMutation.isPending &&
                          commentMutation.variables?.studentId === student.id
                        }
                        className="w-full md:w-auto bg-gray-100 disabled:bg-gray-600 text-black md:text-primary font-bold text-xs py-2.5 md:py-2 px-4 rounded shadow transition cursor-pointer text-center"
                      >
                        {commentMutation.isPending &&
                        commentMutation.variables?.studentId === student.id
                          ? "Saving..."
                          : "Save"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {filteredStudents.length > ITEMS_PER_PAGE && (
          <div className="mt-4 pt-4 border-t border-white/10">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>
    </div>
  );
}
