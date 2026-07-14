"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
  searchParams?: Record<string, string>;
}

function buildPageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | "...")[] = [];

  if (current <= 3) {
    pages.push(1, 2, 3, 4, "...", total);
  } else if (current >= total - 2) {
    pages.push(1, "...", total - 3, total - 2, total - 1, total);
  } else {
    pages.push(1, "...", current - 1, current, current + 1, "...", total);
  }

  return pages;
}

function buildHref(
  baseUrl: string,
  page: number,
  searchParams?: Record<string, string>
) {
  const params = new URLSearchParams(searchParams);
  if (page === 1) {
    params.delete("page");
  } else {
    params.set("page", String(page));
  }
  const qs = params.toString();
  return qs ? `${baseUrl}?${qs}` : baseUrl;
}

export function Pagination({
  currentPage,
  totalPages,
  baseUrl,
  searchParams,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = buildPageNumbers(currentPage, totalPages);

  return (
    <nav className="flex items-center justify-center gap-1 mt-8">
      <Button
        variant="outline"
        size="sm"
        disabled={currentPage <= 1}
        nativeButton={currentPage <= 1 ? undefined : false}
        render={
          currentPage <= 1 ? undefined : (
            <Link href={buildHref(baseUrl, currentPage - 1, searchParams)} />
          )
        }
      >
        <CaretLeftIcon className="size-3" weight="bold" />
        Prev
      </Button>

      {pages.map((page, i) =>
        page === "..." ? (
          <span
            key={`ellipsis-${i}`}
            className="px-2 text-xs text-muted-foreground"
          >
            ...
          </span>
        ) : (
          <Button
            key={page}
            variant={page === currentPage ? "default" : "outline"}
            size="sm"
            nativeButton={page === currentPage ? undefined : false}
            render={
              page === currentPage ? undefined : (
                <Link href={buildHref(baseUrl, page, searchParams)} />
              )
            }
          >
            {page}
          </Button>
        )
      )}

      <Button
        variant="outline"
        size="sm"
        disabled={currentPage >= totalPages}
        nativeButton={currentPage >= totalPages ? undefined : false}
        render={
          currentPage >= totalPages ? undefined : (
            <Link href={buildHref(baseUrl, currentPage + 1, searchParams)} />
          )
        }
      >
        Next
        <CaretRightIcon className="size-3" weight="bold" />
      </Button>
    </nav>
  );
}
