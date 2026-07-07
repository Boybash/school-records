export const generateResultPDF = async (
  settings,
  selectedStudent,
  results,
  term,
  session,
  totalScore,
  average,
  position,
  classSize,
  comments,
) => {
  const { default: jsPDF } = await import("jspdf");
  await import("jspdf-autotable");
  const { default: autoTable } = await import("jspdf-autotable");

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // ── Header ──
  if (settings.logoUrl) {
    try {
      doc.addImage(settings.logoUrl, "JPEG", pageWidth / 2 - 15, 10, 30, 30);
    } catch {}
  }

  let y = settings.logoUrl ? 45 : 15;

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(
    (settings.schoolName || "STUDENT RESULT SHEET").toUpperCase(),
    pageWidth / 2,
    y,
    { align: "center" },
  );
  y += 7;

  if (settings.schoolAddress) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(settings.schoolAddress, pageWidth / 2, y, { align: "center" });
    y += 6;
  }

  if (settings.schoolPhone) {
    doc.setFontSize(10);
    doc.text(settings.schoolPhone, pageWidth / 2, y, { align: "center" });
    y += 6;
  }

  // ── Divider ──
  doc.setDrawColor(200, 200, 200);
  doc.line(14, y, pageWidth - 14, y);
  y += 6;

  // ── Term & Session ──
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(`${term} — ${session} Academic Session`, pageWidth / 2, y, {
    align: "center",
  });
  y += 10;

  // ── Student Info Box ──
  doc.setFillColor(245, 247, 250);
  doc.roundedRect(14, y, pageWidth - 28, 28, 3, 3, "F");

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(100, 100, 100);
  doc.text("Student Name", 20, y + 8);
  doc.text("Matric No.", 80, y + 8);
  doc.text("Class", 140, y + 8);
  doc.text("Gender", 170, y + 8);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(11);
  doc.text(selectedStudent?.name || "", 20, y + 18);
  doc.text(selectedStudent?.matricNumber || "", 80, y + 18);
  doc.text(selectedStudent?.class || "", 140, y + 18);
  doc.text(selectedStudent?.gender || "", 170, y + 18);

  y += 36;

  // ── Results Table ──
  autoTable(doc, {
    startY: y,
    head: [
      [
        "#",
        "Subject",
        "CA (30)",
        "Exam (70)",
        "Total (100)",
        "Grade",
        "Remark",
      ],
    ],
    body: results.map((result, index) => [
      index + 1,
      result.subjectName,
      result.ca,
      result.exam,
      result.score,
      result.grade,
      result.grade === "A"
        ? "Excellent"
        : result.grade === "B"
          ? "Very Good"
          : result.grade === "C"
            ? "Good"
            : result.grade === "D"
              ? "Pass"
              : result.grade === "E"
                ? "Poor"
                : "Fail",
    ]),
    headStyles: {
      fillColor: [37, 99, 235],
      textColor: 255,
      fontStyle: "bold",
      fontSize: 10,
    },
    bodyStyles: {
      fontSize: 10,
      textColor: [30, 30, 30],
    },
    alternateRowStyles: {
      fillColor: [245, 247, 250],
    },
    columnStyles: {
      0: { cellWidth: 10 },
      4: { fontStyle: "bold" },
      5: { fontStyle: "bold" },
    },
    margin: { left: 14, right: 14 },
  });

  y = doc.lastAutoTable.finalY + 10;

  // ── Summary Box ──
  doc.setFillColor(245, 247, 250);
  doc.roundedRect(14, y, pageWidth - 28, 28, 3, 3, "F");

  const colW = (pageWidth - 28) / 4;

  const getOverallGrade = (avg) => {
    if (avg >= 70) return "A";
    if (avg >= 60) return "B";
    if (avg >= 50) return "C";
    if (avg >= 45) return "D";
    if (avg >= 40) return "E";
    return "F";
  };

  const getOrdinal = (n) => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  const summaryItems = [
    { label: "Total Score", value: `${totalScore}` },
    { label: "Average", value: `${average}%` },
    { label: "Overall Grade", value: getOverallGrade(average) },
    {
      label: "Position",
      value: position ? `${getOrdinal(position)} / ${classSize}` : "—",
    },
  ];

  summaryItems.forEach((item, i) => {
    const x = 14 + i * colW + colW / 2;
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text(item.label, x, y + 9, { align: "center" });

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(37, 99, 235);
    doc.text(item.value, x, y + 21, { align: "center" });
  });

  y += 36;

  // ── Comments Section ──
  if (comments?.teacherComment || comments?.principalComment) {
    doc.setDrawColor(200, 200, 200);
    doc.line(14, y, pageWidth - 14, y);
    y += 8;

    const halfWidth = (pageWidth - 34) / 2;

    // Teacher Comment Box
    doc.setFillColor(245, 247, 250);
    doc.roundedRect(14, y, halfWidth, 30, 3, 3, "F");

    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(100, 100, 100);
    doc.text("CLASS TEACHER'S REMARK", 18, y + 8);

    doc.setFontSize(9);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(30, 30, 30);
    const teacherLines = doc.splitTextToSize(
      comments?.teacherComment || "—",
      halfWidth - 8,
    );
    doc.text(teacherLines, 18, y + 16);

    // Principal Comment Box
    doc.setFillColor(245, 247, 250);
    doc.roundedRect(20 + halfWidth, y, halfWidth, 30, 3, 3, "F");

    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(100, 100, 100);
    doc.text("PRINCIPAL'S REMARK", 24 + halfWidth, y + 8);

    doc.setFontSize(9);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(30, 30, 30);
    const principalLines = doc.splitTextToSize(
      comments?.principalComment || "—",
      halfWidth - 8,
    );
    doc.text(principalLines, 24 + halfWidth, y + 16);

    y += 38;
  }

  // ── Footer ──
  doc.setDrawColor(200, 200, 200);
  doc.line(14, y, pageWidth - 14, y);
  y += 6;

  doc.setFontSize(9);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(150, 150, 150);
  doc.text(
    `Generated on ${new Date().toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })}`,
    pageWidth / 2,
    y,
    { align: "center" },
  );

  doc.save(`${selectedStudent?.name}_${term}_${session}.pdf`);
};
