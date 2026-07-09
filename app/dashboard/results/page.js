"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getStudentsForUser } from "@/lib/students";
import { getSubjects } from "@/lib/subjects";
import {
  addResult,
  getResults,
  getResultsByUploader,
  updateResult,
  deleteResult,
  buildResultData,
  getGrade,
  checkDuplicateResult,
} from "@/lib/results";
import { useAuth } from "@/lib/useAuth";
import { TableSkeleton } from "@/components/skeleton";
import Pagination from "@/components/pagination";

export default function ResultsPage() {
  const queryClient = useQueryClient();
  const { userData, role, user } = useAuth();
  const [studentId, setStudentId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [ca, setCa] = useState("");
  const [exam, setExam] = useState("");
  const [term, setTerm] = useState("1st Term");
  const [session, setSession] = useState("2024/2025");
  const [editingResult, setEditingResult] = useState(null);
  const TERMS = ["1st Term", "2nd Term", "3rd Term"];
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const { data: students = [] } = useQuery({
    queryKey: ["students"],
    queryFn: getStudentsForUser,
  });

  const { data: subjects = [] } = useQuery({
    queryKey: ["subjects"],
    queryFn: getSubjects,
  });

  const { data: results = [], isLoading } = useQuery({
    queryKey: ["results", role, user?.uid],
    queryFn: () =>
      role === "teacher" ? getResultsByUploader(user.uid) : getResults(),
    enabled: !!user,
  });

  const visibleStudents =
    role === "teacher"
      ? students.filter((s) => userData?.classes?.includes(s.class))
      : students;

  const visibleSubjects =
    role === "teacher"
      ? subjects.filter((s) => s.id === userData?.subjectId)
      : subjects;

  const addMutation = useMutation({
    mutationFn: addResult,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["results"] });
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data, oldScore, currentUser }) =>
      updateResult(id, data, oldScore, currentUser),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["results"] });
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: ({ id, subjectName, studentName, currentUser }) =>
      deleteResult(id, subjectName, studentName, currentUser),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["results"] });
    },
  });

  const resetForm = () => {
    setStudentId("");
    setSubjectId(role === "teacher" ? userData?.subjectId || "" : "");
    setCa("");
    setExam("");
    setTerm("1st Term");
    setSession("2024/2025");
    setEditingResult(null);
  };

  const handleSubmit = async () => {
    if (!studentId || !subjectId || !ca || !exam)
      return alert("Please fill in all fields");

    // 1. Locate the targeted student document object
    const selectedStudent = students.find((s) => s.id === studentId);
    if (!selectedStudent) return alert("Student not found.");

    // 2. SECURITY CHECK: Enforce class restrictions for teachers on submit
    if (role === "teacher") {
      const hasPermission = userData?.classes?.includes(selectedStudent.class);
      if (!hasPermission) {
        return alert(
          "Unauthorized: You can only record results for your assigned classes.",
        );
      }
    }

    if (Number(ca) > 30) return alert("CA score cannot exceed 30 marks");
    if (Number(exam) > 70) return alert("Exam score cannot exceed 70 marks");
    if (Number(ca) < 0 || Number(exam) < 0)
      return alert("Scores cannot be negative");

    if (!editingResult) {
      const isDuplicate = await checkDuplicateResult(
        studentId,
        subjectId,
        term,
        session,
      );
      if (isDuplicate) {
        return alert(
          `A result for this student in this subject already exists for ${term} ${session}. Use the Edit button to update it instead.`,
        );
      }
    }

    const selectedSubject = subjects.find((s) => s.id === subjectId);

    const data = buildResultData(
      studentId,
      subjectId,
      ca,
      exam,
      term,
      session,
      selectedStudent.name,
      selectedSubject.name,
      role,
      user.uid,
      userData?.name || "Staff Member",
    );

    const currentUser = {
      uid: user.uid,
      name: userData?.name || "Staff Member",
      role: role,
    };

    if (editingResult) {
      const oldScore = editingResult.score;
      updateMutation.mutate({
        id: editingResult.id,
        data,
        oldScore,
        currentUser,
      });
    } else {
      addMutation.mutate(data);
    }
  };

  const handleEdit = (result) => {
    setEditingResult(result);
    setStudentId(result.studentId);
    setSubjectId(result.subjectId);
    setCa(result.ca);
    setExam(result.exam);
    setTerm(result.term);
    setSession(result.session);
  };

  const handleDelete = (resultItem) => {
    if (
      confirm(
        `Are you sure you want to delete the result for ${resultItem.studentName}?`,
      )
    ) {
      const currentUser = {
        uid: user.uid,
        name: userData?.name || "Staff Member",
        role: role,
      };

      deleteMutation.mutate({
        id: resultItem.id,
        subjectName: resultItem.subjectName,
        studentName: resultItem.studentName,
        currentUser,
      });
    }
  };

  const isPending = addMutation.isPending || updateMutation.isPending;
  const total = Number(ca || 0) + Number(exam || 0);

  const totalPages = Math.ceil(results.length / ITEMS_PER_PAGE);

  const paginatedResults = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return results.slice(start, start + ITEMS_PER_PAGE);
  }, [results, currentPage]);

  return (
    <div>
      <h2 className="text-xl font-bold mb-6 uppercase">Results</h2>

      {/* Add/Edit Form */}
      <div className="bg-primary rounded-md shadow p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4 text-white">
          {editingResult ? "Edit Result" : "Enter Result"}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Student */}
          <select
            className="border p-3 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 bg-white"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
          >
            <option value="">Select Student</option>
            {visibleStudents.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} — {s.class}
              </option>
            ))}
          </select>

          {/* Subject */}
          <select
            className="border p-3 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 bg-white"
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
            // disabled={role === "teacher"}
          >
            <option value="">Select Subject</option>
            {visibleSubjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          {/* Term */}
          <select
            className="border p-3 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 bg-white"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
          >
            {TERMS.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>

          {/* Session */}
          <input
            type="text"
            placeholder="Session e.g 2024/2025"
            className="border p-3 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 bg-white"
            value={session}
            onChange={(e) => setSession(e.target.value)}
          />

          <input
            type="number"
            placeholder="CA Score (max 30)"
            className="w-full border p-3 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 bg-white"
            value={ca}
            onChange={(e) => setCa(e.target.value)}
            min={0}
            max={30}
          />

          <input
            type="number"
            placeholder="Exam Score (max 70)"
            className="w-full border p-3 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 bg-white"
            value={exam}
            onChange={(e) => setExam(e.target.value)}
            min={0}
            max={70}
          />
        </div>

        {/* Live Total Preview */}
        {(ca || exam) && (
          <div className="mt-4 p-4 bg-gray-50 rounded-md flex items-center gap-6 text-sm">
            <span className="text-gray-500">
              CA: <span className="font-bold text-gray-800">{ca || 0}/30</span>
            </span>
            <span className="text-gray-500">
              Exam:{" "}
              <span className="font-bold text-gray-800">{exam || 0}/70</span>
            </span>
            <span className="text-gray-500">
              Total:{" "}
              <span
                className={`font-bold text-lg ${total >= 70 ? "text-green-600" : total >= 50 ? "text-blue-600" : "text-red-500"}`}
              >
                {total}/100
              </span>
            </span>
            <span className="text-gray-500">
              Grade:{" "}
              <span className="font-bold text-purple-600">
                {getGrade(total)}
              </span>
            </span>
          </div>
        )}

        <div className="flex gap-3 mt-4">
          <button
            onClick={handleSubmit}
            disabled={isPending}
            className="bg-gray-100 text-primary px-6 py-3 rounded-md font-semibold transition cursor-pointer"
          >
            {isPending
              ? "Saving..."
              : editingResult
                ? "Update Result"
                : "Save Result"}
          </button>
          {editingResult && (
            <button
              onClick={resetForm}
              className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-primary rounded-md shadow p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-6">
          <h3 className="text-lg font-semibold mb-4 text-white">All Results</h3>
          <p className="text-sm text-gray-400">
            Showing {paginatedResults.length} of {results.length} students
          </p>
        </div>
        {isLoading ? (
          <TableSkeleton rows={5} cols={6} dark={true} />
        ) : paginatedResults.length === 0 ? (
          <p className="text-gray-400">No results recorded yet.</p>
        ) : (
          <>
            {/* 1. MOBILE RESPONSIVE CARD VIEW (Visible below md screen threshold) */}
            <div className="grid grid-cols-1 gap-4 md:hidden mb-4">
              {paginatedResults.map((result, index) => (
                <div
                  key={result.id}
                  className="border border-white/10 bg-white/5 rounded-lg p-4 flex flex-col gap-3"
                >
                  {/* Header: Row index, Status Badge & Actions */}
                  <div className="flex justify-between items-center border-b border-white/10 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400 font-mono">
                        #{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                      </span>
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          result.status === "approved"
                            ? "bg-green-500/20 text-green-300"
                            : result.status === "rejected"
                              ? "bg-red-500/20 text-red-300"
                              : "bg-yellow-500/20 text-yellow-300"
                        }`}
                      >
                        {result.status || "Approved"}
                      </span>
                    </div>

                    {/* Actions (Only visible if authorized) */}
                    <div className="flex gap-2">
                      {(role === "admin" ||
                        result.uploadedBy === user?.uid) && (
                        <>
                          <button
                            onClick={() => handleEdit(result)}
                            className="text-white bg-blue-500 px-2.5 py-1 rounded-md text-xs font-medium cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(result)}
                            className="text-white bg-red-500 px-2.5 py-1 rounded-md text-xs font-medium cursor-pointer"
                          >
                            Delete
                          </button>
                        </>
                      )}
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

                  {/* Scores Layout Breakdown Grid */}
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

                  {/* Term & Session Metadata footer */}
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

            {/* 2. DESKTOP TABULAR VIEW (Hidden on mobile, renders from md breakpoint up) */}
            <div className="hidden md:block ">
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
                    <th className="pb-3 text-gray-400 font-medium w-[7%]">
                      Term
                    </th>
                    <th className="pb-3 text-gray-400 font-medium w-[9%]">
                      Session
                    </th>
                    <th className="pb-3 text-gray-400 font-medium w-[10%]">
                      Status
                    </th>
                    <th className="pb-3 text-gray-400 font-medium w-[10%]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedResults.map((result, index) => (
                    <tr
                      key={result.id}
                      className="border-b border-white/10 last:border-0 text-white hover:bg-white/5 transition"
                    >
                      <td className="py-3 text-gray-400">{index + 1}</td>
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
                        <span
                          className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap uppercase ${
                            result.status === "approved"
                              ? "bg-green-500/20 text-green-300"
                              : result.status === "rejected"
                                ? "bg-red-500/20 text-red-300"
                                : "bg-yellow-500/20 text-yellow-300"
                          }`}
                        >
                          {result.status || "Approved"}
                        </span>
                      </td>
                      <td className="py-3">
                        <div className="flex gap-2">
                          {(role === "admin" ||
                            result.uploadedBy === user?.uid) && (
                            <>
                              <button
                                onClick={() => handleEdit(result)}
                                className="text-white bg-blue-500 px-3 py-1.5 rounded-md text-xs font-medium cursor-pointer hover:bg-blue-600 transition"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(result)}
                                className="text-white bg-red-500 px-3 py-1.5 rounded-md text-xs font-medium cursor-pointer hover:bg-red-600 transition"
                              >
                                Delete
                              </button>
                            </>
                          )}
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
    </div>
  );
}
