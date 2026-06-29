"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  addSubject,
  getSubjects,
  updateSubject,
  deleteSubject,
} from "@/lib/subjects";
import Link from "next/link";
import { TableSkeleton } from "@/components/skeleton";

export default function SubjectsPage() {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [editingSubject, setEditingSubject] = useState(null);
  const [deleetingSubjectId, setDeletingSubjectId] = useState(null);

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

  const handleDelete = (id) => {
    setDeletingSubjectId(true);
    deleteMutation.mutate(id);
  };

  const handleCancel = () => {
    setEditingSubject(null);
    setName("");
  };

  const isPending = addMutation.isPending || updateMutation.isPending;

  return (
    <div className="relative">
      <h2 className="text-xl font-bold mb-6 uppercase">Subjects</h2>

      {/* Add/Edit Form */}
      <div className="bg-primary rounded-md shadow p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4 text-white">
          {editingSubject ? "Edit Subject" : "Add New Subject"}
        </h3>
        <div className="flex-col gap-4 md:flex md:gap-4">
          <input
            type="text"
            placeholder="Subject name e.g Mathematics"
            className="flex-1 border p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-400 bg-white"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button
            onClick={handleSubmit}
            disabled={isPending}
            className="bg-gray-100 md:w-[250px] text-primary px-6 py-3 rounded-md font-semibold cursor-pointer transition mt-2 md:mt-0"
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
              className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Subjects List */}
      <div className="bg-primary rounded-md shadow p-6">
        <h3 className="text-lg font-semibold mb-4 text-white">All Subjects</h3>
        {isLoading ? (
          <TableSkeleton rows={5} cols={6} dark={true} />
        ) : subjects.length === 0 ? (
          <p className="text-gray-400">No subjects added yet.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/30">
                <th className="pb-3 text-gray-500">#</th>
                <th className="pb-3 text-gray-500">Subject</th>
                <th className="pb-3 text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((subject, index) => (
                <tr
                  key={subject.id}
                  className="border-b border-white/30 last:border-0 hover:bg-white/5 transition"
                >
                  <td className="py-3 text-gray-400">{index + 1}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <img
                        src="/book.png"
                        alt="book"
                        className="w-8 h-8 rounded-full bg-white p-1.5 object-contain"
                      />
                      <span className="text-white truncate">
                        {subject.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-3">
                    <div className="flex gap-5">
                      <button
                        onClick={() => handleEdit(subject)}
                        className="text-white bg-blue-500 p-2 rounded-md text-sm cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(subject.id)}
                        className="text-white cursor-pointer text-sm bg-red-500 p-2 rounded-md"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
