export default function Footer() {
  return (
    <footer className="bg-[#052659] text-gray-400 py-10 px-6 text-center">
      <div className="flex items-center justify-center gap-3 mb-4">
        <div className="bg-blue-600 text-white w-8 h-8 rounded-lg flex items-center justify-center font-bold">
          S
        </div>
        <p className="text-white font-semibold">Shalom Model College</p>
      </div>
      <p className="text-sm mb-2">Student Records Management System</p>
      <p className="text-xs text-gray-600">
        © {new Date().getFullYear()} Shalom Model College. All rights reserved.
      </p>
    </footer>
  );
}
