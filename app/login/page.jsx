"use client";

import { useState } from "react";
import { loginUser } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
    setLoading(true);
    setError("");
    try {
      await loginUser(email, password);
      router.push("/dashboard");
    } catch (err) {
      setError("Invalid email or password");
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
        <h1 className="text-2xl font-bold text-center mb-6 text-[#021024]">
          School Records
        </h1>

        {error && (
          <p className="text-red-500 text-sm text-center mb-4">{error}</p>
        )}

        <input
          type="email"
          placeholder="Email"
          className="w-full p-3 rounded-lg mb-4 outline-none border focus:ring-2 focus:ring-[#052659]"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full  p-3 rounded-lg mb-6 outline-none border focus:ring-2 focus:ring-[#052659]"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-[#052659] text-white py-3 rounded-md font-semibold hover:bg-[#021024] transition cursor-pointer"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
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
