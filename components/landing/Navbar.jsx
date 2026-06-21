"use client";

import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Features", href: "#features" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Contact", href: "#contact" },
  ];

  return (
    <nav className="bg-[#052659] px-10 py-5 flex justify-between items-center sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <div>
          <p className="font-bold text-[#c1e8ff] text-xl ">
            Shalom Model College
          </p>
        </div>
      </div>
      <div className="hidden md:flex items-center gap-15">
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
      <div className="flex items-center gap-3">
        <Link
          href="/parent/login"
          className="bg-[#c1e8ff] text-[#052659] text-sm px-5 py-2 rounded-md hover:bg-[#021024] hover:text-white transition font-semibold"
        >
          Parent Portal
        </Link>
        <Link
          href="/login"
          className="bg-[#c1e8ff] text-[#052659] text-sm px-5 py-2 rounded-md hover:bg-[#021024] hover:text-white transition font-semibold"
        >
          Staff Login
        </Link>
      </div>
    </nav>
  );
}
