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
        <div className="flex flex-col gap-1.5 md:gap-3 max-w-3xl">
          <h2 className="text-white text-3xl sm:text-5xl sm:text-4xl font-extrabold uppercase tracking-[0.2em] text-center md:text-left opacity-90">
            Shalom Model College
          </h2>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold uppercase leading-tight text-center md:text-left text-white">
            Smart Student Records Management
          </h1>
          <p className="text-base sm:text-lg mt:2 md:mt-4 text-center md:text-left text-gray-100 max-w-xl">
            Manage student results, generate report cards, and give parents
            instant access to their child's academic performance — all in one
            place.
          </p>
        </div>

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

// "use client";

// import Link from "next/link";
// import { useState, useEffect } from "react";

// export default function Hero() {
//   const [current, setCurrent] = useState(0);
//   const images = [
//     "/shalom image 6.webp",
//     "/shalom image 2.webp",
//     "/shalom image 5.webp",
//   ];

//   useEffect(() => {
//     const interval = setInterval(() => {
//       setCurrent((prev) => (prev + 1) % images.length);
//     }, 3000); // changes every 5 seconds

//     return () => clearInterval(interval);
//   }, []);

//   return (
//     <section className="relative text-white py-40 px-6 overflow-hidden">
//       {/* Sliding Images */}
//       <div
//         className="absolute inset-0 flex transition-transform duration-700 ease-in-out"
//         style={{ transform: `translateX(-${current * 100}%)` }}
//       >
//         {images.map((img) => (
//           <div
//             key={img}
//             className="min-w-full h-full"
//             style={{
//               backgroundImage: `url('${img}')`,
//               backgroundSize: "cover",
//               backgroundPosition: "center",
//               backgroundRepeat: "no-repeat",
//             }}
//           />
//         ))}
//       </div>

//       {/* Dark Overlay */}
//       <div className="absolute inset-0 bg-[#052659]/40" />

//       {/* Content */}
//       <div className="flex justify-between relative z-10">
//         <div className="flex flex-col gap-1 ml-5">
//           <h1 className="text-white text-4xl sm:text-5xl font-extrabold uppercase tracking-widest text-left">
//             Shalom Model College
//           </h1>
//           <h1 className="text-4xl sm:text-5xl font-extrabold uppercase leading-tight max-w-3xl text-left text-white">
//             Smart Student Records Management
//           </h1>
//           <p className=" text-lg max-w-xl mb-10 text-left text-white">
//             Manage student results, generate report cards, and give parents
//             instant access to their child's academic performance — all in one
//             place.
//           </p>
//         </div>
//         <div className="flex flex-col sm:flex-col gap-4 justify-center mr-20 mb-20">
//           <Link
//             href="/login"
//             className="bg-[#052659] text-white text-center font-semibold px-8 py-3 rounded-md hover:bg-[#c1e8ff] hover:text-[#021024] transition"
//           >
//             Staff Login
//           </Link>
//           <Link
//             href="/parent/login"
//             className="border border-white text-white font-semibold px-8 py-3 rounded-md hover:bg-[#c1e8ff] hover:text-gray-800 transition"
//           >
//             Check Your Child's Result
//           </Link>
//         </div>
//       </div>
//     </section>
//   );
// }
