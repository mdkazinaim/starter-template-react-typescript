import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  totalPrograms: number;
  onPageChange: (page: number) => void;
}

const Pagination = ({
  currentPage,
  totalPages,
  itemsPerPage,
  totalPrograms,
  onPageChange,
}: PaginationProps) => {
  if (totalPages <= 1) return null; // No need for pagination if only 1 page
  const getPageButtons = () => {
    const buttons: (number | string)[] = [];

    for (let i = 1; i <= totalPages; i++) {
      // Show first 2, last, current ±1
      if (
        i === 1 ||
        i === 2 ||
        i === totalPages ||
        (i >= currentPage - 1 && i <= currentPage + 1)
      ) {
        buttons.push(i);
      } else if (i === currentPage - 2 || i === currentPage + 2) {
        buttons.push("...");
      }
    }

    // Remove duplicate "..."
    return buttons.filter(
      (btn, idx, arr) => !(btn === "..." && arr[idx - 1] === "...")
    );
  };

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalPrograms);

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-2 px-6 py-4 border-t border-gray-200">
      {/* Showing X to Y of Z */}
      <div className="text-sm text-gray-600">
        Showing {startItem} to {endItem} of{" "}
        <span className="font-semibold">{totalPrograms}</span>{" "}
        Programs
      </div>

      {/* Pagination Buttons */}
      <div className="flex items-center gap-2">
        {/* Prev Button */}
        <button
          onClick={() => {
            onPageChange(Math.max(1, currentPage - 1));
          }}
          disabled={currentPage === 1}
          className="flex items-center gap-1 px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={16} />
          Prev
        </button>

        {/* Page Buttons */}
        {getPageButtons().map((btn, idx) =>
          btn === "..." ? (
            <span key={idx} className="px-2 text-gray-500">
              ...
            </span>
          ) : (
            <button
              key={idx}
              onClick={() => onPageChange(btn as number)}
              className={`px-3 py-2 text-sm rounded-md ${
                currentPage === btn
                  ? "bg-blue-600 text-white"
                  : "border border-gray-300 hover:bg-gray-50"
              }`}
            >
              {btn}
            </button>
          )
        )}

        {/* Next Button */}
        <button
          onClick={() =>
            onPageChange(Math.min(totalPages, currentPage + 1))
          }
          disabled={currentPage === totalPages}
          className="flex items-center gap-1 px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
