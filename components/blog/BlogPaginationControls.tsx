"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Pagination } from "@/components/ui/Pagination";

interface BlogPaginationControlsProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
}

export function BlogPaginationControls({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
}: BlogPaginationControlsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handlePageChange(newPage: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`/blog?${params.toString()}`, { scroll: true });
  }

  return (
    <div className="blog-pagination-container" style={{ marginTop: "40px" }}>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={pageSize}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
