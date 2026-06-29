"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getStudentByMatric } from "@/lib/students";
import Link from "next/link";

const MAX_ATTEMPTS = 3;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

export default function ParentLoginPage() {
  const router = useRouter();
  const [matricNumber, setMatricNumber] = useState("");
  const [surname, setSurname] = useState("");
  const [dob, setDob] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [current, setCurrent] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);

  const images = [
    "/shalomlogo.svg",
    // "/shalom image 2.webp",
    // "/shalom image 5.webp",
  ];

  // Image slider
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     setCurrent((prev) => (prev + 1) % images.length);
  //   }, 3000);
  //   return () => clearInterval(interval);
  // }, []);

  // Load attempts and lockout from localStorage on mount
  useEffect(() => {
    const savedAttempts = parseInt(
      localStorage.getItem("parentLoginAttempts") || "0",
    );
    const savedLockedUntil = parseInt(
      localStorage.getItem("parentLoginLockedUntil") || "0",
    );
    setAttempts(savedAttempts);
    if (savedLockedUntil > Date.now()) {
      setLockedUntil(savedLockedUntil);
    } else {
      localStorage.removeItem("parentLoginLockedUntil");
      localStorage.removeItem("parentLoginAttempts");
    }
  }, []);

  // Countdown timer
  useEffect(() => {
    if (!lockedUntil) return;
    const interval = setInterval(() => {
      const remaining = lockedUntil - Date.now();
      if (remaining <= 0) {
        setLockedUntil(null);
        setAttempts(0);
        setTimeLeft(0);
        localStorage.removeItem("parentLoginLockedUntil");
        localStorage.removeItem("parentLoginAttempts");
        clearInterval(interval);
      } else {
        setTimeLeft(Math.ceil(remaining / 1000));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [lockedUntil]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleFailedAttempt = () => {
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    localStorage.setItem("parentLoginAttempts", newAttempts.toString());
    if (newAttempts >= MAX_ATTEMPTS) {
      const lockUntil = Date.now() + LOCKOUT_DURATION;
      setLockedUntil(lockUntil);
      localStorage.setItem("parentLoginLockedUntil", lockUntil.toString());
      setError("");
    }
  };

  const handleLogin = async () => {
    if (lockedUntil) return;
    if (!matricNumber || !surname || !dob)
      return setError("Please fill in all fields");
    setLoading(true);
    setError("");

    try {
      const student = await getStudentByMatric(matricNumber.toUpperCase());

      if (!student) {
        handleFailedAttempt();
        setError("Student not found. Check the matric number.");
        setLoading(false);
        return;
      }

      const studentSurname = student.name.split(" ")[0].toLowerCase();
      const enteredSurname = surname.trim().toLowerCase();

      if (studentSurname !== enteredSurname) {
        handleFailedAttempt();
        setError("Incorrect surname. Please try again.");
        setLoading(false);
        return;
      }

      if (student.dob !== dob) {
        handleFailedAttempt();
        setError("Incorrect date of birth. Please try again.");
        setLoading(false);
        return;
      }

      // Success — clear attempts
      localStorage.removeItem("parentLoginAttempts");
      localStorage.removeItem("parentLoginLockedUntil");

      const response = await fetch("/api/parent-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: student.id }),
      });

      if (!response.ok) throw new Error("Failed to create session");
      router.push("/parent/result");
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const isLocked = lockedUntil && lockedUntil > Date.now();

  return (
    <div className="relative min-h-screen flex items-center justify-center px-6 overflow-hidden">
      {/* Sliding Images */}
      <div
        className="absolute inset-0 flex transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {images.map((img) => (
          <div
            key={img}
            className="min-w-full h-full"
            style={{
              backgroundImage: `url('${img}')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          />
        ))}
      </div>

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/70" />

      <div className="relative z-10 bg-[#c1e8ff] p-8 rounded-md shadow-md w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-[#021024]">Parent Portal</h1>
          <p className="text-gray-500 text-sm mt-1">
            Enter your child's matric number, surname and date of birth to view
            their results
          </p>
        </div>

        {/* Lockout Message */}
        {isLocked ? (
          <div className="text-center py-6">
            <p className="text-4xl mb-3">🔒</p>
            <p className="text-red-600 font-semibold mb-2">
              Too many failed attempts
            </p>
            <p className="text-gray-500 text-sm mb-4">
              Please wait before trying again
            </p>
            <div className="bg-red-50 rounded-lg p-4">
              <p className="text-red-600 text-2xl font-bold">
                {formatTime(timeLeft)}
              </p>
              <p className="text-red-400 text-xs mt-1">remaining</p>
            </div>
          </div>
        ) : (
          <>
            {error && (
              <p className="text-red-500 text-sm text-center mb-4">{error}</p>
            )}

            {/* Attempts Warning */}
            {attempts > 0 && attempts < MAX_ATTEMPTS && (
              <div className="bg-yellow-50 text-yellow-600 text-sm p-3 rounded-lg mb-4 text-center">
                ⚠️ {MAX_ATTEMPTS - attempts} attempt
                {MAX_ATTEMPTS - attempts === 1 ? "" : "s"} remaining before
                lockout
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-500 mb-1 block">
                  Matric Number
                </label>
                <input
                  type="text"
                  placeholder="e.g GFS/2025/001"
                  className="w-full p-3 rounded-lg outline-none border focus:ring-2 focus:ring-[#052659]"
                  value={matricNumber}
                  onChange={(e) => setMatricNumber(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm text-gray-500 mb-1 block">
                  Surname
                </label>
                <input
                  type="text"
                  placeholder="Enter student's surname"
                  className="w-full p-3 rounded-lg outline-none border focus:ring-2 focus:ring-[#052659]"
                  value={surname}
                  onChange={(e) => setSurname(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm text-gray-500 mb-1 block">
                  Date of Birth
                </label>
                <input
                  type="date"
                  className="w-full p-3 rounded-lg outline-none border focus:ring-2 focus:ring-[#052659]"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                />
              </div>
            </div>

            <button
              onClick={handleLogin}
              disabled={loading || !!isLocked}
              className="w-full mt-6 bg-[#052659] text-white py-3 rounded-md font-semibold hover:bg-[#021024] transition cursor-pointer disabled:opacity-50"
            >
              {loading ? "Checking..." : "View Results"}
            </button>

            <p className="text-center text-xs text-gray-400 mt-4">
              Having trouble? Contact the school admin.
            </p>
          </>
        )}
      </div>

      <Link
        href="/"
        className="flex gap-2 items-center bg-[#c1e8ff] p-2 rounded-md absolute top-5 md:top-10 left-7"
      >
        <img className="w-5 h-5" src="/arrow-l.png" alt="arrow" />
        Back
      </Link>
    </div>
  );
}
