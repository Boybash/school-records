import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="bg-[#5483B3] px-10 flex justify-between items-center sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <div>
          <p className="font-bold text-gray-800 text-sm ">
            Shalom Model College
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Link
          href="/parent/login"
          className="text-sm text-gray-600 hover:text-blue-600 transition font-medium"
        >
          Parent Portal
        </Link>
        <Link
          href="/login"
          className="bg-blue-600 text-white text-sm px-5 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
        >
          Staff Login
        </Link>
      </div>
    </nav>
  );
}
