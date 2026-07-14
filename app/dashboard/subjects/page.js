"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  addSubject,
  getSubjects,
  updateSubject,
  deleteSubject,
} from "@/lib/subjects";
import Link from "next/link";
import { TableSkeleton } from "@/components/skeleton";
import Pagination from "@/components/pagination";

export default function SubjectsPage() {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [editingSubject, setEditingSubject] = useState(null);
  const [deletingSubjectId, setDeletingSubjectId] = useState(null); // Fixed typo here
  const [currentPage, setCurrentPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const ITEMS_PER_PAGE = 10;

  const { data: subjects = [], isLoading } = useQuery({
    queryKey: ["subjects"],
    queryFn: getSubjects,
  });

  const addMutation = useMutation({
    mutationFn: addSubject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
      setName("");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateSubject(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
      setEditingSubject(null);
      setName("");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSubject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
      setDeletingSubjectId(null);
    },
    onError: () => {
      setDeletingSubjectId(null);
    },
  });

  const handleSubmit = () => {
    if (!name) return alert("Please enter a subject name");
    if (editingSubject) {
      updateMutation.mutate({ id: editingSubject.id, data: { name } });
    } else {
      addMutation.mutate({ name });
    }
  };

  const handleEdit = (subject) => {
    setEditingSubject(subject);
    setName(subject.name);
  };

  const openDeleteModal = (id) => {
    setDeletingSubjectId(id);
    setModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (deletingSubjectId) {
      deleteMutation.mutate(deletingSubjectId, {
        onSuccess: () => {
          setModalOpen(false);
          setDeletingSubjectId(null);
        },
      });
    }
  };

  const handleCancel = () => {
    setEditingSubject(null);
    setName("");
  };

  const isPending = addMutation.isPending || updateMutation.isPending;

  const totalPages = Math.ceil(subjects.length / ITEMS_PER_PAGE);

  const paginatedSubjects = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return subjects.slice(start, start + ITEMS_PER_PAGE);
  }, [subjects, currentPage]);

  return (
    <div className="relative">
      <h2 className="text-xl font-bold mb-6 uppercase">Subjects</h2>

      {/* Add/Edit Form */}
      <div className="bg-primary rounded-md shadow p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4 text-white">
          {editingSubject ? "Edit Subject" : "Add New Subject"}
        </h3>
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <input
            type="text"
            placeholder="Subject name e.g Mathematics"
            className="flex-1 border p-3 rounded-lg outline-none focus:ring-2 focus:ring-primary-50 bg-white"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <div className="flex flex-col sm:flex-row gap-2 mt-2 md:mt-0">
            <button
              onClick={handleSubmit}
              disabled={isPending}
              className="bg-gray-100 md:w-[250px] text-primary px-6 py-3 rounded-md font-semibold cursor-pointer transition disabled:opacity-50"
            >
              {isPending
                ? "Saving..."
                : editingSubject
                  ? "Update Subject"
                  : "Add Subject"}
            </button>
            {editingSubject && (
              <button
                onClick={handleCancel}
                className="bg-gray-200 md:w-[120px] text-gray-700 px-6 py-3 rounded-md font-semibold hover:bg-gray-300 transition cursor-pointer"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Subjects List Container */}
      <div className="bg-primary rounded-md shadow p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-6 pb-4 border-b border-white/10">
          <h3 className="text-lg font-semibold text-white">All Subjects</h3>
          <p className="text-sm text-gray-400">
            Showing {paginatedSubjects.length} of {subjects.length} subjects
          </p>
        </div>

        {isLoading ? (
          <TableSkeleton rows={5} cols={3} dark={true} />
        ) : paginatedSubjects.length === 0 ? (
          <p className="text-gray-400 py-4 text-center">
            No subjects added yet.
          </p>
        ) : (
          <>
            {/* 1. MOBILE RESPONSIVE CARD VIEW (Visible below md breakpoint) */}
            <div className="grid grid-cols-1 gap-4 md:hidden mb-6">
              {paginatedSubjects.map((subject, index) => (
                <div
                  key={subject.id}
                  className="border border-white/10 bg-white/5 rounded-lg p-4 flex flex-col gap-4"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-400 font-mono">
                      #{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(subject)}
                        className="bg-blue-500 text-white hover:bg-blue-600 px-3 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => openDeleteModal(subject.id)}
                        disabled={
                          deleteMutation.isPending &&
                          deletingSubjectId === subject.id
                        }
                        className="bg-red-500 text-white hover:bg-red-600 px-3 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer disabled:opacity-50"
                      >
                        {deleteMutation.isPending &&
                        deletingSubjectId === subject.id
                          ? "Deleting..."
                          : "Delete"}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <img
                      src="/book.png"
                      alt="book"
                      className="w-9 h-9 rounded-full bg-white p-2 object-contain flex-shrink-0"
                    />
                    <span className="text-white font-medium text-base truncate">
                      {subject.name}
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
                    <th className="pb-3 text-gray-400 font-medium w-[10%]">
                      #
                    </th>
                    <th className="pb-3 text-gray-400 font-medium w-[65%]">
                      Subject
                    </th>
                    <th className="pb-3 text-gray-400 font-medium w-[25%]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedSubjects.map((subject, index) => (
                    <tr
                      key={subject.id}
                      className="border-b border-white/10 last:border-0 text-white hover:bg-white/5 transition"
                    >
                      <td className="py-3.5 text-gray-400">
                        #{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                      </td>
                      <td className="py-3.5">
                        <div className="flex items-center gap-3">
                          <img
                            src="/book.png"
                            alt="book"
                            className="w-8 h-8 rounded-full bg-white p-1.5 object-contain"
                          />
                          <span className="text-white font-medium truncate">
                            {subject.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5">
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleEdit(subject)}
                            className="text-white bg-blue-500 hover:bg-blue-600 px-3 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => openDeleteModal(subject.id)}
                            disabled={
                              deleteMutation.isPending &&
                              deletingSubjectId === subject.id
                            }
                            className="text-white bg-red-500 hover:bg-red-600 px-3 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer disabled:opacity-50"
                          >
                            {deleteMutation.isPending &&
                            deletingSubjectId === subject.id
                              ? "Deleting..."
                              : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* <Link
        href="/"
        className="flex gap-2 items-center bg-primary-50 p-2 rounded-md absolute top-0 right-0 text-sm font-medium hover:opacity-90 transition"
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
              Are you sure you want to delete this subject?
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => {
                  setModalOpen(false);
                  setDeletingSubjectId(null);
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
