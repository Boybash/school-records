"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function Hero() {
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

  return (
    <section className="relative text-white py-40 px-6 overflow-hidden">
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
      <div className="absolute inset-0 bg-[#052659]/40" />

      {/* Content */}
      <div className="flex justify-between relative z-10">
        <div className="flex flex-col gap-1 ml-5">
          <h1 className="text-white text-4xl sm:text-5xl font-extrabold uppercase tracking-widest text-left">
            Shalom Model College
          </h1>
          <h1 className="text-4xl sm:text-5xl font-extrabold uppercase leading-tight max-w-3xl text-left text-white">
            Smart Student Records Management
          </h1>
          <p className=" text-lg max-w-xl mb-10 text-left text-white">
            Manage student results, generate report cards, and give parents
            instant access to their child's academic performance — all in one
            place.
          </p>
        </div>
        <div className="flex flex-col sm:flex-col gap-4 justify-center mr-20 mb-20">
          <Link
            href="/login"
            className="bg-[#052659] text-white text-center font-semibold px-8 py-3 rounded-md hover:bg-[#c1e8ff] hover:text-[#021024] transition"
          >
            Staff Login
          </Link>
          <Link
            href="/parent/login"
            className="border border-white text-white font-semibold px-8 py-3 rounded-md hover:bg-[#c1e8ff] hover:text-gray-800 transition"
          >
            Check Your Child's Result
          </Link>
        </div>
      </div>
    </section>
  );
}
