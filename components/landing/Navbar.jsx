"use client";

import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  // Unified function to handle smooth scrolling and close the mobile menu
  const handleNavigation = (e, scrollFn) => {
    if (scrollFn) {
      e.preventDefault(); // Prevents default browser harsh snap jumps
      scrollFn();
    }
    setMenuOpen(false); // Closes the mobile drawer on link click
  };

  const scrollToAbout = () => {
    document.getElementById("about")?.scrollIntoView({ behavior: "smooth" });
  };
  const scrollToFeatures = () => {
    document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
  };
  const scrollToHowitworks = () => {
    document
      .getElementById("how-it-works")
      ?.scrollIntoView({ behavior: "smooth" });
  };
  const scrollToContact = () => {
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
  };

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "About Us", href: "#about", handleScroll: scrollToAbout },
    { label: "Features", href: "#features", handleScroll: scrollToFeatures },
    {
      label: "How It Works",
      href: "#how-it-works",
      handleScroll: scrollToHowitworks,
    },
    { label: "Contact", href: "#contact", handleScroll: scrollToContact },
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
              onClick={(e) => handleNavigation(e, link.handleScroll)}
              className="text-[#c1e8ff] uppercase hover:border-b-3 hover:border-[#c1e8ff] transition font-semibold"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Desktop Buttons */}
        <div className="hidden lg:flex items-center gap-3">
          <Link
            href="/login"
            className="bg-[#c1e8ff] text-[#052659] text-sm px-5 py-2 rounded-md hover:bg-primary-50 hover:text-white transition font-semibold"
          >
            Staff Login
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="block lg:hidden cursor-pointer"
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
              onClick={(e) => handleNavigation(e, link.handleScroll)}
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
