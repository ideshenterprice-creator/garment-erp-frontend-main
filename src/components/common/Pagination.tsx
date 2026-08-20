"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PaginationProps {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  label?: string;
}

export function Pagination({
  page,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  label = "entries",
}: PaginationProps) {
  if (totalItems === 0) {
    return null;
  }

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);

  const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1).slice(
    0,
    Math.min(totalPages, 5)
  );

  return (
    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">
        Showing {start}–{end} of {totalItems} {label}
      </p>
      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="size-8 p-0"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          aria-label="Previous page"
        >
          <ChevronLeft className="size-4" />
        </Button>
        {pageNumbers.map((pageNumber) => (
          <Button
            key={pageNumber}
            type="button"
            size="sm"
            variant={page === pageNumber ? "default" : "outline"}
            className={cn(
              "size-8 p-0",
              page === pageNumber && "bg-slate-900 text-white hover:bg-slate-800"
            )}
            onClick={() => onPageChange(pageNumber)}
          >
            {pageNumber}
          </Button>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="size-8 p-0"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          aria-label="Next page"
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
