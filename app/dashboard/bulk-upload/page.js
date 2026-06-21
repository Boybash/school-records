"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getStudents } from "@/lib/students";
import { getSubjects } from "@/lib/subjects";
import {
  downloadTemplate,
  parseResultsFile,
  uploadResults,
} from "@/lib/bulkUpload";
import { useAuth } from "@/lib/useAuth";

const TERMS = ["1st Term", "2nd Term", "3rd Term"];

export default function BulkUploadPage() {
  const { role, userData } = useAuth();
  const [term, setTerm] = useState("1st Term");
  const [session, setSession] = useState("2024/2025");
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);

  const { data: students = [] } = useQuery({
    queryKey: ["students"],
    queryFn: getStudents,
  });

  const { data: subjects = [] } = useQuery({
    queryKey: ["subjects"],
    queryFn: getSubjects,
  });

  const visibleStudents =
    role === "teacher"
      ? students.filter((s) => userData?.classes?.includes(s.class))
      : students;

  const visibleSubjects =
    role === "teacher"
      ? subjects.filter((s) => s.id === userData?.subjectId)
      : subjects;

  const handleDownloadTemplate = () => {
    if (!term || !session) return alert("Please select term and session first");
    downloadTemplate(visibleStudents, visibleSubjects, term, session);
  };

  const handleUpload = async () => {
    if (!file) return alert("Please select a file first");
    setUploading(true);
    setResult(null);

    try {
      const rows = await parseResultsFile(file);
      const { successes, errors } = await uploadResults(rows, role);
      setResult({ successes, errors });
    } catch (err) {
      alert("Failed to read file. Make sure it is a valid Excel file.");
    } finally {
      setUploading(false);
      setFile(null);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Bulk Upload Results</h2>

      {/* Step 1 - Download Template */}
      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <div className="flex items-center gap-3 mb-2">
          <span className="bg-blue-600 text-white w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold">
            1
          </span>
          <h3 className="text-lg font-semibold">Download Template</h3>
        </div>
        <p className="text-gray-500 text-sm mb-4 ml-10">
          Download the Excel template pre-filled with student and subject names.
          Fill in the CA and Exam scores then upload.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 ml-10 mb-4">
          <select
            className="border p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-400"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
          >
            {TERMS.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Session e.g 2024/2025"
            className="border p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-400"
            value={session}
            onChange={(e) => setSession(e.target.value)}
          />
        </div>

        <button
          onClick={handleDownloadTemplate}
          className="ml-10 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
        >
          📥 Download Template
        </button>
      </div>

      {/* Step 2 - Fill & Upload */}
      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <div className="flex items-center gap-3 mb-2">
          <span className="bg-blue-600 text-white w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold">
            2
          </span>
          <h3 className="text-lg font-semibold">Upload Filled Template</h3>
        </div>
        <p className="text-gray-500 text-sm mb-4 ml-10">
          After filling in the scores, upload the file here. Do not change the
          column headers or student/subject IDs.
        </p>

        <div className="ml-10">
          <input
            type="file"
            accept=".xlsx, .xls"
            className="border p-3 rounded-lg w-full sm:w-auto outline-none"
            onChange={(e) => setFile(e.target.files[0])}
          />
          <button
            onClick={handleUpload}
            disabled={uploading || !file}
            className="mt-4 block bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
          >
            {uploading ? "Uploading..." : "📤 Upload Results"}
          </button>
        </div>
      </div>

      {/* Upload Result */}
      {result && (
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Upload Summary</h3>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-green-600">
                {result.successes.length}
              </p>
              <p className="text-sm text-gray-500">Successfully uploaded</p>
            </div>
            <div className="bg-red-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-red-500">
                {result.errors.length}
              </p>
              <p className="text-sm text-gray-500">Failed</p>
            </div>
          </div>

          {result.errors.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-red-500 mb-2">Errors:</p>
              <ul className="text-sm text-red-400 space-y-1">
                {result.errors.map((err, i) => (
                  <li key={i}>❌ {err}</li>
                ))}
              </ul>
            </div>
          )}

          {result.successes.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-semibold text-green-600 mb-2">
                Uploaded:
              </p>
              <ul className="text-sm text-green-500 space-y-1">
                {result.successes.map((s, i) => (
                  <li key={i}>✅ {s}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
