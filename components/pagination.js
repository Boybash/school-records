export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-col md:flex-row items-center justify-between  mt-4 text-sm">
      <p className="text-gray-400 mb-5 sm:mb-0">
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
        {(() => {
          // 1. Configure how many page buttons you want to show around the current page
          const maxVisible = 2;
          let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
          let endPage = Math.min(totalPages, startPage + maxVisible - 1);

          // 2. Adjust window boundaries if hitting the end of the line
          if (endPage - startPage + 1 < maxVisible) {
            startPage = Math.max(1, endPage - maxVisible + 1);
          }

          // 3. Generate and map only the visible slice
          return Array.from(
            { length: endPage - startPage + 1 },
            (_, i) => startPage + i,
          ).map((page) => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`px-4 py-2 rounded-lg border text-sm font-medium transition cursor-pointer ${
                currentPage === page
                  ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                  : "text-gray-400 border-white/10 hover:bg-white/5"
              }`}
            >
              {page}
            </button>
          ));
        })()}
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
