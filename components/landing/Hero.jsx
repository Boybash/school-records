"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Fade, Slide } from "react-awesome-reveal";

export default function Hero() {
  const [current, setCurrent] = useState(0);
  const images = ["/classroom1.jpg", "/classroom2.jpg", "/classroom3.jpg"];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 3000); // changes every 3 seconds

    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <section className="relative text-white py-20 sm:py-32 lg:py-40 px-6 sm:px-12 lg:px-20 overflow-hidden min-h-[90vh] flex items-center">
      {/* Sliding Images Wrapper */}
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
      <div className="absolute inset-0 bg-[#052659]/50" />

      {/* Content Container */}
      <div className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-start lg:items-center gap-12 relative z-10">
        {/* Left Side: Text Details */}
        <Fade cascade damping={0.15} triggerOnce>
          <div className="flex flex-col gap-1.5 md:gap-1 max-w-3xl">
            <h2 className="text-white text-3xl sm:text-5xl lg:text-6xl font-extrabold uppercase  text-center md:text-left opacity-90">
              SchoolDesk Model College
            </h2>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold uppercase  text-center md:text-left text-white">
              Smart Student Records Management
            </h1>
            <p className="text-base sm:text-lg mt:2 md:mt-1 text-center md:text-left text-gray-100 max-w-xl">
              Manage student results, generate report cards, and give parents
              instant access to their child's academic performance — all in one
              place.
            </p>
          </div>
        </Fade>

        {/* Right Side: Action Link Buttons */}

        <div className="flex flex-col sm:flex-row lg:flex-col gap-4 w-full sm:w-auto shrink-0">
          <Link
            href="/login"
            className="bg-[#052659] text-white text-center font-semibold px-8 py-3.5 rounded-md hover:bg-[#c1e8ff] hover:text-[#021024] transition w-full sm:w-64 whitespace-nowrap"
          >
            Staff Login
          </Link>
          <Link
            href="/parent/login"
            className="border border-white text-white text-center font-semibold px-8 py-3.5 rounded-md hover:bg-[#c1e8ff] hover:text-gray-800 transition w-full sm:w-auto whitespace-nowrap"
          >
            Check Your Child's Result
          </Link>
        </div>
      </div>
    </section>
  );
}
