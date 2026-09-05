"use client";

import * as React from "react";
import { cn } from "@repo/utils";
import { Button } from "./button";

interface PaginationProps extends React.HTMLAttributes<HTMLElement> {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination = React.forwardRef<HTMLElement, PaginationProps>(
  ({ className, currentPage, totalPages, onPageChange, ...props }, ref) => {
    const pages = React.useMemo(() => {
      const delta = 2;
      const range = [];
      for (
        let i = Math.max(2, currentPage - delta);
        i <= Math.min(totalPages - 1, currentPage + delta);
        i++
      ) {
        range.push(i);
      }

      if (currentPage - delta > 2) {
        range.unshift("...");
      }
      if (currentPage + delta < totalPages - 1) {
        range.push("...");
      }

      range.unshift(1);
      if (totalPages > 1) {
        range.push(totalPages);
      }

      return range;
    }, [currentPage, totalPages]);

    return (
      <nav
        ref={ref}
        className={cn("flex items-center justify-center gap-1", className)}
        aria-label="Pagination"
        {...props}
      >
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          aria-label="Previous page"
        >
          Previous
        </Button>
        {pages.map((page, index) => (
          <Button
            key={index}
            variant={page === currentPage ? "default" : "outline"}
            size="sm"
            onClick={() => typeof page === "number" && onPageChange(page)}
            disabled={page === "..."}
            aria-label={typeof page === "number" ? `Page ${page}` : undefined}
            aria-current={page === currentPage ? "page" : undefined}
          >
            {page}
          </Button>
        ))}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          aria-label="Next page"
        >
          Next
        </Button>
      </nav>
    );
  }
);
Pagination.displayName = "Pagination";

export { Pagination };
