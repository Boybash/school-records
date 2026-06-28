"use client";

import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Features", href: "#features" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "About Us", href: "#about" },
    { label: "Contact", href: "#contact" },
  ];

  return (
    <nav className="bg-primary px-5 md:px-10 py-2 sticky top-0 z-50">
      <div className="flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <img
            src="/shalomlogo.svg"
            alt="Shalom logo"
            className="w-16 h-16 shadow-sm"
          />
        </div>

        {/* Desktop Links */}
        <div className="hidden lg:flex items-center gap-15">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-[#c1e8ff] uppercase hover:border-b-3 hover:border-[#c1e8ff] transition font-semibold"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Desktop Buttons */}
        <div className="hidden lg:flex items-center gap-3">
          <Link
            href="/parent/login"
            className="bg-[#c1e8ff] text-[#052659] text-sm px-5 py-2 rounded-md hover:bg-primary-50 hover:text-white transition font-semibold"
          >
            Parent Portal
          </Link>
          <Link
            href="/login"
            className="bg-[#c1e8ff] text-[#052659] text-sm px-5 py-2 rounded-md hover:bg-primary-50 hover:text-white transition font-semibold"
          >
            Staff Login
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="block lg:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <img
            src={menuOpen ? "/icons8-x-96.png" : "/menu2.png"}
            alt="menu"
            className="w-12 h-12"
          />
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="lg:hidden mt-4 pb-4 border-t border-[#c1e8ff]/20 pt-4 flex flex-col gap-4">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="text-[#c1e8ff] uppercase font-semibold text-sm hover:text-white transition"
            >
              {link.label}
            </a>
          ))}
          <hr className="border-[#c1e8ff]/20" />
          <Link
            href="/parent/login"
            onClick={() => setMenuOpen(false)}
            className="bg-[#c1e8ff] text-[#052659] text-sm px-5 py-2 rounded-md font-semibold text-center"
          >
            Parent Portal
          </Link>
          <Link
            href="/login"
            onClick={() => setMenuOpen(false)}
            className="bg-[#c1e8ff] text-[#052659] text-sm px-5 py-2 rounded-md font-semibold text-center"
          >
            Staff Login
          </Link>
        </div>
      )}
    </nav>
  );
}

// "use client";

// import Link from "next/link";
// import { useState } from "react";

// export default function Navbar() {
//   const [menuOpen, setMenuOpen] = useState(false);

//   const navLinks = [
//     { label: "Home", href: "/" },
//     { label: "Features", href: "#features" },
//     { label: "How It Works", href: "#how-it-works" },
//     { label: "About Us", href: "#about" },
//     { label: "Contact", href: "#contact" },
//   ];

//   return (
//     <nav className="bg-primary px-10 py-2 flex justify-between items-center sticky top-0 z-50">
//       <div className="flex items-center gap-3">
//         <div>
//           <img
//             src="/shalomlogo.svg"
//             alt="Shalom logo"
//             className="w-16 h-16 shadow-sm"
//           />
//         </div>
//       </div>
//       <div className="hidden lg:flex items-center gap-15">
//         {navLinks.map((link) => (
//           <a
//             key={link.href}
//             href={link.href}
//             className="text-[#c1e8ff] uppercase hover:border-b-3 hover:border-[#c1e8ff] transition font-semibold"
//           >
//             {link.label}
//           </a>
//         ))}
//       </div>
//       <div className=" hidden lg:flex items-center gap-3">
//         <Link
//           href="/parent/login"
//           className="bg-[#c1e8ff] text-[#052659] text-sm px-5 py-2 rounded-md hover:bg-primary-50 hover:text-white transition font-semibold"
//         >
//           Parent Portal
//         </Link>
//         <Link
//           href="/login"
//           className="bg-[#c1e8ff] text-[#052659] text-sm px-5 py-2 rounded-md hover:bg-primary-50 hover:text-white transition font-semibold"
//         >
//           Staff Login
//         </Link>
//       </div>
//       <div className="block lg:hidden">
//         <img
//           src={menuOpen ? "/xmark.svg" : "xmenu.png"}
//           alt="menu"
//           className="block lg:hidden w-7 h-7"
//         />
//       </div>
//     </nav>
//   );
// }
