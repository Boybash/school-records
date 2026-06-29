export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between mt-4 text-sm">
      <p className="text-gray-400">
        Page {currentPage} of {totalPages}
      </p>
      <div className="flex gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-4 py-2 rounded-lg border text-gray-600 bg-gray-100 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`px-4 py-2 rounded-lg border transition ${
              currentPage === page
                ? "bg-blue-600 text-white border-blue-600"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {page}
          </button>
        ))}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-4 py-2 rounded-lg border text-gray-600 bg-gray-100 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
}
