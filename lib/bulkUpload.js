import * as XLSX from "xlsx";
import { buildResultData } from "@/lib/results";
import { addResult } from "@/lib/results";

export const downloadTemplate = (students, subjects, term, session) => {
  const rows = students
    .map((student) =>
      subjects.map((subject) => ({
        StudentName: student.name,
        StudentId: student.id,
        MatricNumber: student.matricNumber,
        Class: student.class,
        SubjectName: subject.name,
        SubjectId: subject.id,
        Term: term,
        Session: session,
        CA: "",
        Exam: "",
      })),
    )
    .flat();

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Results");
  XLSX.writeFile(wb, `results_template_${term}_${session}.xlsx`);
};

export const parseResultsFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet);
        resolve(rows);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
};

export const uploadResults = async (rows, role) => {
  const errors = [];
  const successes = [];

  for (const row of rows) {
    try {
      if (
        !row.StudentId ||
        !row.SubjectId ||
        row.CA === "" ||
        row.Exam === ""
      ) {
        errors.push(`Missing data for ${row.StudentName} - ${row.SubjectName}`);
        continue;
      }

      if (Number(row.CA) > 30) {
        errors.push(
          `CA score exceeds 30 for ${row.StudentName} - ${row.SubjectName}`,
        );
        continue;
      }

      if (Number(row.Exam) > 70) {
        errors.push(
          `Exam score exceeds 70 for ${row.StudentName} - ${row.SubjectName}`,
        );
        continue;
      }

      const data = buildResultData(
        row.StudentId,
        row.SubjectId,
        row.CA,
        row.Exam,
        row.Term,
        row.Session,
        row.StudentName,
        row.SubjectName,
        role,
      );

      await addResult(data);
      successes.push(`${row.StudentName} - ${row.SubjectName}`);
    } catch (err) {
      errors.push(`Failed to upload ${row.StudentName} - ${row.SubjectName}`);
    }
  }

  return { successes, errors };
};
