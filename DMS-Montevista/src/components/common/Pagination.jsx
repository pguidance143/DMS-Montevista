import { ChevronLeft, ChevronRight } from "lucide-react";

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

const Pagination = ({ page, totalPages, total, limit, onPageChange, onLimitChange }) => {
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to   = Math.min(page * limit, total);

  // Build page number list with ellipsis
  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "...") {
      pages.push("...");
    }
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t border-gray-100">

      {/* Left — rows per page + record count */}
      <div className="flex items-center gap-4">
        {onLimitChange && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 whitespace-nowrap">Rows per page:</span>
            <select
              value={limit}
              onChange={(e) => { onLimitChange(Number(e.target.value)); onPageChange(1); }}
              className="border border-gray-200 rounded-md text-xs text-gray-700 px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-blue-400 cursor-pointer"
            >
              {PAGE_SIZE_OPTIONS.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
        )}

        <p className="text-xs text-gray-500">
          {total === 0 ? (
            "No records"
          ) : (
            <>
              Showing{" "}
              <span className="font-medium text-gray-700">{from}–{to}</span>
              {" "}of{" "}
              <span className="font-medium text-gray-700">{total}</span>{" "}
              records
            </>
          )}
        </p>
      </div>

      {/* Right — page navigation */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1 || totalPages === 0}
          className="p-1.5 rounded-md text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {totalPages <= 1 ? (
          <span className="w-7 h-7 flex items-center justify-center rounded-md text-xs font-medium bg-blue-600 text-white">
            1
          </span>
        ) : (
          pages.map((p, i) =>
            p === "..." ? (
              <span key={`dots-${i}`} className="px-1 text-xs text-gray-400">…</span>
            ) : (
              <button
                key={p}
                onClick={() => onPageChange(p)}
                className={`w-7 h-7 rounded-md text-xs font-medium transition
                  ${p === page ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100"}`}
              >
                {p}
              </button>
            )
          )
        )}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages || totalPages === 0}
          className="p-1.5 rounded-md text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};

export default Pagination;
