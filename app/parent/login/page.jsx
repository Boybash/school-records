"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getStudentByMatric } from "@/lib/students";
import Link from "next/link";

export default function ParentLoginPage() {
  const router = useRouter();
  const [matricNumber, setMatricNumber] = useState("");
  const [surname, setSurname] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [current, setCurrent] = useState(0);
  const images = [
    "/shalom image 6.webp",
    "/shalom image 2.webp",
    "/shalom image 5.webp",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 3000); // changes every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const handleLogin = async () => {
    if (!matricNumber || !surname) return setError("Please fill in all fields");
    setLoading(true);
    setError("");

    try {
      const student = await getStudentByMatric(matricNumber.toUpperCase());

      if (!student) {
        setError("Student not found. Check the matric number.");
        setLoading(false);
        return;
      }

      // Check surname matches (case insensitive)
      const studentSurname = student.name.split(" ")[0].toLowerCase();
      const enteredSurname = surname.trim().toLowerCase();

      if (studentSurname !== enteredSurname) {
        setError("Incorrect surname. Please try again.");
        setLoading(false);
        return;
      }

      // Save student id to sessionStorage and redirect
      sessionStorage.setItem("parentStudentId", student.id);
      router.push("/parent/result");
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-6 overflow-hidden">
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
            Enter your child's matric number and surname to view their results
          </p>
        </div>

        {error && (
          <p className="text-red-500 text-sm text-center mb-4">{error}</p>
        )}

        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-500 mb-1 block">
              Matric Number
            </label>
            <input
              type="text"
              placeholder="e.g GFS/2025/001"
              className="w-full  p-3 rounded-lg outline-none border focus:ring-2 focus:ring-[#052659]"
              value={matricNumber}
              onChange={(e) => setMatricNumber(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm text-gray-500 mb-1 block">Surname</label>
            <input
              type="text"
              placeholder="Enter student's surname"
              className="w-full p-3 rounded-lg outline-none border focus:ring-2 focus:ring-[#052659]"
              value={surname}
              onChange={(e) => setSurname(e.target.value)}
            />
          </div>
        </div>

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full mt-6 bg-[#052659] text-white py-3 rounded-md font-semibold hover:bg-[#021024] transition cursor-pointer"
        >
          {loading ? "Checking..." : "View Results"}
        </button>

        <p className="text-center text-xs text-gray-400 mt-4">
          Having trouble? Contact the school admin.
        </p>
      </div>

      <Link
        href="/"
        className=" flex gap-2 items-center bg-[#c1e8ff] p-2 rounded-md absolute top-10 left-10 "
      >
        <img className="w-5 h-5" src="/arrow-l.png" alt="arrow" />
        Back
      </Link>
    </div>
  );
}
