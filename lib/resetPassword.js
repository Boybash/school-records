export const resetTeacherPassword = async (uid, newPassword) => {
  const response = await fetch("/api/reset-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ uid, newPassword }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to reset password");
  }

  return data;
};
