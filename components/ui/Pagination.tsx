"use client";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  pageSize?: number;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  pageSize,
  className = "",
}: PaginationProps) {
  if (totalPages <= 1 && !totalItems) return null;

  // Generate page numbers with ellipsis
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("…");

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) pages.push("…");
      pages.push(totalPages);
    }
    return pages;
  };

  const startItem = totalItems && pageSize ? (currentPage - 1) * pageSize + 1 : null;
  const endItem =
    totalItems && pageSize ? Math.min(currentPage * pageSize, totalItems) : null;

  return (
    <div className={`pagination-wrapper ${className}`} aria-label="Pagination Navigation">
      {totalItems !== undefined && startItem !== null && endItem !== null && (
        <span className="pagination-summary">
          Showing <strong>{totalItems === 0 ? 0 : startItem}–{endItem}</strong> of <strong>{totalItems}</strong>
        </span>
      )}

      <div className="pagination-controls">
        <button
          type="button"
          className="pagination-btn pagination-prev"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          aria-label="Previous Page"
        >
          ‹ Prev
        </button>

        <div className="pagination-pages">
          {getPageNumbers().map((p, idx) =>
            typeof p === "number" ? (
              <button
                key={p}
                type="button"
                className={`pagination-num ${currentPage === p ? "is-active" : ""}`}
                onClick={() => onPageChange(p)}
                aria-current={currentPage === p ? "page" : undefined}
                aria-label={`Go to page ${p}`}
              >
                {p}
              </button>
            ) : (
              <span key={`ellipsis-${idx}`} className="pagination-ellipsis">
                {p}
              </span>
            )
          )}
        </div>

        <button
          type="button"
          className="pagination-btn pagination-next"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          aria-label="Next Page"
        >
          Next ›
        </button>
      </div>
    </div>
  );
}
