"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  addStudent,
  getStudentsForUser,
  updateStudent,
  deleteStudent,
} from "@/lib/students";
import { useAuth } from "@/lib/useAuth";
import Pagination from "@/components/pagination";
import Link from "next/link";
import { TableSkeleton, FormSkeleton } from "@/components/skeleton";

export default function StudentsPage() {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [className, setClassName] = useState("");
  const [gender, setGender] = useState("Male");
  const [editingStudent, setEditingStudent] = useState(null);
  const [search, setSearch] = useState("");
  const [filterClass, setFilterClass] = useState("");
  const [filterGender, setFilterGender] = useState("");
  const { userData, role } = useAuth();
  const [matricNumber, setMatricNumber] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [dob, setDob] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [formError, setFormError] = useState({
    matricNumber: "",
    name: "",
    className: "",
    gender: "",
    dob: "",
  });
  const ITEMS_PER_PAGE = 10;

  const { data: students = [], isLoading } = useQuery({
    queryKey: ["students"],
    queryFn: getStudentsForUser,
  });

  // Get unique classes from students for filter dropdown
  const classes = useMemo(() => {
    return [...new Set(students.map((s) => s.class))].sort();
  }, [students]);

  const formAvailableClasses = useMemo(() => {
    if (role === "teacher") {
      return userData?.classes || [];
    }
    return classes;
  }, [role, userData, classes]);

  // update the filteredStudents useMemo to add class restriction for teachers:
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesSearch =
        student.name.toLowerCase().includes(search.toLowerCase()) ||
        student.matricNumber?.toLowerCase().includes(search.toLowerCase());
      const matchesClass = filterClass ? student.class === filterClass : true;
      const matchesGender = filterGender
        ? student.gender === filterGender
        : true;
      const matchesTeacherClass =
        role === "teacher" ? userData?.classes?.includes(student.class) : true;
      return (
        matchesSearch && matchesClass && matchesGender && matchesTeacherClass
      );
    });
  }, [students, search, filterClass, filterGender, role, userData]);

  const totalPages = Math.ceil(filteredStudents.length / ITEMS_PER_PAGE);

  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredStudents.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredStudents, currentPage]);

  const addMutation = useMutation({
    mutationFn: addStudent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      setName("");
      setClassName("");
      setGender("Male");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateStudent(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      setEditingStudent(null);
      setName("");
      setClassName("");
      setGender("Male");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteStudent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
  });

  const handleSubmit = () => {
    setFormError({
      matricNumber: "",
      name: "",
      className: "",
      dob: "",
      gender: "",
    });

    const trimmedName = name.trim();
    const trimmedClass = className.trim();
    const trimmedMatric = matricNumber.trim();

    // Track if we find any errors
    let hasError = false;
    const newErrors = { matricNumber: "", name: "", className: "", dob: "" };

    if (!trimmedMatric) {
      newErrors.matricNumber = "Matric number is required";
      hasError = true;
    }
    if (!trimmedName) {
      newErrors.name = "Full name is required";
      hasError = true;
    }
    if (!trimmedClass) {
      newErrors.className = "Class is required";
      hasError = true;
    }
    if (!dob) {
      newErrors.dob = "Date of birth is required";
      hasError = true;
    }
    if (!gender) {
      newErrors.gender = "Gender is required";
      hasError = true;
    }

    if (role === "teacher" && !userData?.classes?.includes(trimmedClass)) {
      newErrors.className = "Unauthorized class selection";
      hasError = true;
    }

    const existingStudents = editingStudent
      ? students.filter((s) => s.id !== editingStudent.id)
      : students;

    const usedMatricNumbers = existingStudents.map((s) =>
      s.matricNumber.toLowerCase(),
    );

    if (usedMatricNumbers.includes(trimmedMatric.toLowerCase())) {
      newErrors.matricNumber = "Matric number already exists";
      hasError = true;
    }

    if (hasError) {
      return setFormError(newErrors);
    }

    const studentPayload = {
      name: trimmedName,
      class: trimmedClass,
      gender,
      matricNumber: trimmedMatric,
      dob,
    };

    if (editingStudent) {
      updateMutation.mutate({
        id: editingStudent.id,
        data: studentPayload,
      });
    } else {
      addMutation.mutate(studentPayload);
    }
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
    setName(student.name);
    setClassName(student.class);
    setGender(student.gender);
    setMatricNumber(student.matricNumber);
    setDob(student.dob || "");
  };

  const openDeleteModal = (id) => {
    setSelectedStudentId(id);
    setModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedStudentId) {
      deleteMutation.mutate(selectedStudentId, {
        onSuccess: () => {
          setModalOpen(false);
          setSelectedStudentId(null);
        },
      });
    }
  };

  const handleCancel = () => {
    setEditingStudent(null);
    setName("");
    setClassName("");
    setGender("Male");
    setMatricNumber("");
    setDob("");
  };

  const isPending = addMutation.isPending || updateMutation.isPending;
  const isAdmin = role === "admin";

  return (
    <div className="relative">
      <h2 className="text-xl font-bold mb-6 uppercase">Students</h2>

      {/* Add/Edit Form */}
      <div className="bg-[#021024] rounded-md shadow p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4 text-white">
          {editingStudent ? "Edit Student" : "Add New Student"}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <input
              type="text"
              placeholder="Matric Number e.g GFS/2025/001"
              className="w-full border p-3 rounded-lg outline-none focus:ring-2 focus:ring-primary-50 bg-white"
              value={matricNumber}
              onChange={(e) => setMatricNumber(e.target.value)}
            />
            {formError.matricNumber && (
              <p className="text-red-500 text-sm mt-1">
                {formError.matricNumber}
              </p>
            )}
          </div>
          <div className="sm:col-span-2 lg:col-span-1">
            <input
              type="text"
              placeholder="Full Name"
              className="w-full border p-3 rounded-lg outline-none focus:ring-2 focus:ring-primary-50 bg-white"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            {formError.name && (
              <p className="text-red-500 text-sm mt-1">{formError.name}</p>
            )}
          </div>
          {isAdmin ? (
            <div className="sm:col-span-2 lg:col-span-1">
              <input
                type="text"
                placeholder="Class Format e.g JSS 1A"
                className="w-full border p-3 rounded-lg outline-none focus:ring-2 focus:ring-primary-50 bg-white"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
              />
              {formError.className && (
                <p className="text-red-500 text-sm mt-1">
                  {formError.className}
                </p>
              )}
            </div>
          ) : (
            <div className="sm:col-span-2 lg:col-span-1">
              <select
                className="w-full border p-3 rounded-lg outline-none focus:ring-2 focus:ring-primary-50 bg-white"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
              >
                <option value="" className="bg-primary-50 text-gray-100">
                  Select Class
                </option>
                {formAvailableClasses.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              {formError.className && (
                <p className="text-red-500 text-sm mt-1">
                  {formError.className}
                </p>
              )}
            </div>
          )}
          <div className="sm:col-span-2 lg:col-span-1">
            <select
              className="w-full border p-3 rounded-lg outline-none focus:ring-2 focus:ring-primary-50 bg-white"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
            >
              <option>Male</option>
              <option>Female</option>
            </select>
            {formError.gender && (
              <p className="text-red-500 text-sm mt-1">{formError.gender}</p>
            )}
          </div>
          <div className="sm:col-span-2 lg:col-span-1">
            <input
              type="date"
              className="w-full  border p-3 rounded-lg outline-none focus:ring-2 focus:ring-primary-50 bg-white"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
            />
            {formError.dob && (
              <p className="text-red-500 text-sm mt-1">{formError.dob}</p>
            )}
          </div>
        </div>
        <div className="flex gap-3 mt-4">
          <button
            onClick={handleSubmit}
            disabled={isPending}
            className="bg-gray-100 text-primary px-6 py-3 rounded-md transition font-semibold cursor-pointer"
          >
            {isPending
              ? "Saving..."
              : editingStudent
                ? "Update Student"
                : "Add Student"}
          </button>
          {editingStudent && (
            <button
              onClick={handleCancel}
              className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-[#021024] rounded-md shadow p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4 text-white">
          Search & Filter
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Search by name or matric number..."
            className="border p-3 rounded-lg outline-none focus:ring-2 focus:ring-primary-50 bg-white"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
          />
          {isAdmin ? (
            <select
              className="border p-3 rounded-lg outline-none focus:ring-2 focus:ring-primary-50 bg-white"
              value={filterClass}
              onChange={(e) => {
                setFilterClass(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">All Classes</option>
              {classes.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          ) : (
            <select
              className="border p-3 rounded-lg outline-none focus:ring-2 focus:ring-primary-50 bg-white"
              value={filterClass}
              onChange={(e) => {
                setFilterClass(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">All Classes</option>
              {formAvailableClasses.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          )}
          <select
            className="border p-3 rounded-lg outline-none focus:ring-2 focus:ring-primary-50 bg-white"
            value={filterGender}
            onChange={(e) => {
              setFilterGender(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">All Genders</option>
            <option>Male</option>
            <option>Female</option>
          </select>
        </div>
        {(search || filterClass || filterGender) && (
          <button
            onClick={() => {
              setSearch("");
              setFilterClass("");
              setFilterGender("");
            }}
            className="mt-3 text-sm text-red-500 hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Students Table */}
      <div className="bg-[#021024] rounded-md shadow p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-6">
          <h3 className="text-lg font-semibold text-white">All Students</h3>
          <p className="text-sm text-gray-400">
            Showing {paginatedStudents.length} of {filteredStudents.length}{" "}
            students
          </p>
        </div>
        {isLoading ? (
          <TableSkeleton rows={5} cols={6} dark={true} />
        ) : paginatedStudents.length === 0 ? (
          <p className="text-gray-400">No students found.</p>
        ) : (
          <>
            {/* 1. MOBILE RESPONSIVE CARD VIEW (Visible below sm screen threshold) */}
            <div className="grid grid-cols-1 gap-4 sm:hidden mb-6">
              {paginatedStudents.map((student, index) => (
                <div
                  key={student.id}
                  className="border border-white/10 bg-white/5 rounded-lg p-4 flex flex-col gap-2"
                >
                  <div className="flex justify-between items-center border-b border-white/10 pb-2">
                    <span className="text-xs text-gray-400 font-mono">
                      #{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                    </span>
                    <span className="font-semibold text-sm text-blue-400">
                      {student.matricNumber}
                    </span>
                  </div>
                  <div className="text-sm">
                    <p className="text-white font-medium text-base">
                      {student.name}
                    </p>
                    <div className="flex gap-4 mt-1 text-xs text-gray-300">
                      <p>
                        <span className="text-gray-500">Class:</span>{" "}
                        {student.class}
                      </p>
                      <p>
                        <span className="text-gray-500">Gender:</span>{" "}
                        {student.gender}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3 justify-end mt-2 pt-2 border-t border-white/10">
                    <button
                      onClick={() => handleEdit(student)}
                      className="text-white bg-blue-500 px-4 py-2 rounded-md text-xs font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => openDeleteModal(student.id)}
                      className="text-white bg-red-500 px-4 py-2 rounded-md text-xs font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* 2. DESKTOP TABULAR VIEW (Hidden on mobile devices, renders from sm breakpoint up) */}
            {/* 1. Added table-layout-fixed to force the table to span edge-to-edge */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left text-sm table-fixed border-collapse">
                <thead>
                  <tr className="border-b border-white/30">
                    {/* 2. Set explicit percentage or fractional widths on the headers */}
                    <th className="pb-3 text-gray-500 w-[5%]">#</th>
                    <th className="pb-3 text-gray-500 w-[20%]">Matric No.</th>
                    <th className="pb-3 text-gray-500 w-[25%]">Name</th>
                    <th className="pb-3 text-gray-500 w-[15%]">Class</th>
                    <th className="pb-3 text-gray-500 w-[15%]">Gender</th>
                    <th className="pb-3 text-gray-500 w-[20%]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedStudents.map((student, index) => (
                    <tr
                      key={student.id}
                      className="border-b border-white/30 last:border-0 hover:bg-white/5 transition"
                    >
                      <td className="py-3 text-gray-400">
                        {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                      </td>
                      <td className="py-3 font-semibold text-blue-400 truncate">
                        {student.matricNumber}
                      </td>
                      {/* 3. Added truncate so exceptionally long student names do not deform your columns */}
                      <td className="py-3 text-white truncate pr-4">
                        {student.name}
                      </td>
                      <td className="py-3 text-white">{student.class}</td>
                      <td className="py-3 text-white">{student.gender}</td>
                      <td className="py-3 flex gap-4">
                        <button
                          onClick={() => handleEdit(student)}
                          className="text-white bg-blue-500 px-3 py-1.5 rounded-md text-xs hover:bg-blue-600 transition cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => openDeleteModal(student.id)}
                          className="text-white bg-red-500 px-3 py-1.5 rounded-md text-xs hover:bg-red-600 transition cursor-pointer"
                        >
                          Delete
                        </button>
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
      {/* <Link
        href="/"
        className=" flex gap-2 items-center bg-primary-50 p-2 rounded-md absolute top-0 right-0 "
      >
        <img className="w-5 h-5" src="/arrow-l.png" alt="arrow" />
        Back
      </Link> */}

      {modalOpen && (
        <div className="fixed inset-0 bg-black/70 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-md shadow-lg w-80">
            <h2 className="text-lg font-semibold mb-4 text-gray-900">
              Confirm Deletion
            </h2>
            <p className="mb-4 text-gray-600">
              Are you sure you want to delete this student?
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => {
                  setModalOpen(false);
                  setSelectedStudentId(null);
                }}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md cursor-pointer transition font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete} // 👈 Fixed this handler callback
                disabled={deleteMutation.isPending}
                className="bg-red-600 text-white px-4 py-2 rounded-md cursor-pointer transition font-bold disabled:opacity-50"
              >
                {deleteMutation.isPending ? "Deleting..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
