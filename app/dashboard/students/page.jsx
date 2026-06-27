"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  addStudent,
  getStudents,
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
  const ITEMS_PER_PAGE = 10;

  const { data: students = [], isLoading } = useQuery({
    queryKey: ["students"],
    queryFn: getStudents,
  });

  // Get unique classes from students for filter dropdown
  const classes = useMemo(() => {
    return [...new Set(students.map((s) => s.class))].sort();
  }, [students]);

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
    if (!name || !className || !matricNumber || !dob)
      return alert("Please fill in all fields");
    if (editingStudent) {
      updateMutation.mutate({
        id: editingStudent.id,
        data: { name, class: className, gender, matricNumber, dob },
      });
    } else {
      addMutation.mutate({ name, class: className, gender, matricNumber, dob });
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

  const handleDelete = (id) => {
    deleteMutation.mutate(id);
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

  return (
    <div className="relative">
      <h2 className="text-xl font-bold mb-6 uppercase">Students</h2>

      {/* Add/Edit Form */}
      <div className="bg-[#021024] rounded-md shadow p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4 text-white">
          {editingStudent ? "Edit Student" : "Add New Student"}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <input
            type="text"
            placeholder="Matric Number e.g GFS/2025/001"
            className="border p-3 rounded-lg outline-none focus:ring-2 focus:ring-primary-50 bg-white"
            value={matricNumber}
            onChange={(e) => setMatricNumber(e.target.value)}
          />
          <input
            type="text"
            placeholder="Full Name"
            className="border p-3 rounded-lg outline-none focus:ring-2 focus:ring-primary-50 bg-white"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            type="text"
            placeholder="Class e.g JSS 1A"
            className="border p-3 rounded-lg outline-none focus:ring-2 focus:ring-primary-50 bg-white"
            value={className}
            onChange={(e) => setClassName(e.target.value)}
          />
          <select
            className="border p-3 rounded-lg outline-none focus:ring-2 focus:ring-primary-50 bg-white"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
          >
            <option>Male</option>
            <option>Female</option>
          </select>
          <div>
            {/* <label className="text-xs text-white mb-1 block">
              Date of Birth
            </label> */}
            <input
              type="date"
              className="w-full  border p-3 rounded-lg outline-none focus:ring-2 focus:ring-primary-50 bg-white"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
            />
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
      <div className="bg-[#021024] rounded-md shadow p-6">
        <div className="flex justify-between items-center mb-4">
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
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/30">
                  <th className="pb-3 text-gray-500">#</th>
                  <th className="pb-3 text-gray-500">Matric No.</th>
                  <th className="pb-3 text-gray-500">Name</th>
                  <th className="pb-3 text-gray-500">Class</th>
                  <th className="pb-3 text-gray-500">Gender</th>
                  <th className="pb-3 text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedStudents.map((student, index) => (
                  <tr
                    key={student.id}
                    className="border-b border-white/30 last:border-0"
                  >
                    <td className="py-3 text-gray-400">
                      {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                    </td>
                    <td className="py-3 font-semibold text-blue-600">
                      {student.matricNumber}
                    </td>
                    <td className="py-3 text-white">{student.name}</td>
                    <td className="py-3 text-white">{student.class}</td>
                    <td className="py-3 text-white">{student.gender}</td>
                    <td className="py-3 flex gap-5">
                      <button
                        onClick={() => handleEdit(student)}
                        className="text-white bg-blue-500 p-2 rounded-md text-sm cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(student.id)}
                        className="text-white cursor-pointer text-sm bg-red-500 p-2 rounded-md"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

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
        className=" flex gap-2 items-center bg-primary-50 p-2 rounded-md absolute top-0 right-10 "
      >
        <img className="w-5 h-5" src="/arrow-l.png" alt="arrow" />
        Back
      </Link>
    </div>
  );
}
