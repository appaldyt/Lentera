"use client";

import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

interface Props {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  itemsPerPage: number;
  searchParams: Record<string, string>;
}

export function HistoryPagination({ currentPage, totalPages, totalCount, itemsPerPage, searchParams }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  const goTo = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(page));
    router.push(`${pathname}?${params.toString()}`);
  };

  const start = (currentPage - 1) * itemsPerPage + 1;
  const end = Math.min(currentPage * itemsPerPage, totalCount);

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
    .reduce<(number | "...")[]>((acc, p, idx, arr) => {
      if (idx > 0 && (p as number) - (arr[idx - 1] as number) > 1) acc.push("...");
      acc.push(p);
      return acc;
    }, []);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-1 py-2">
      <p className="text-sm text-text-secondary">
        Menampilkan{" "}
        <span className="font-medium text-navy">{start}–{end}</span>{" "}
        dari <span className="font-medium text-navy">{totalCount}</span> riwayat training
      </p>
      <div className="flex items-center gap-1">
        <Button variant="outline" size="sm" className="h-8 px-3" disabled={currentPage === 1} onClick={() => goTo(1)}>«</Button>
        <Button variant="outline" size="sm" className="h-8 px-3" disabled={currentPage === 1} onClick={() => goTo(currentPage - 1)}>‹</Button>
        {pageNumbers.map((item, idx) =>
          item === "..." ? (
            <span key={`e-${idx}`} className="px-2 text-text-secondary text-sm">…</span>
          ) : (
            <Button
              key={item}
              variant={currentPage === item ? "default" : "outline"}
              size="sm"
              className={`h-8 w-8 p-0${currentPage === item ? " bg-navy text-surface" : ""}`}
              onClick={() => goTo(item as number)}
            >
              {item}
            </Button>
          )
        )}
        <Button variant="outline" size="sm" className="h-8 px-3" disabled={currentPage === totalPages} onClick={() => goTo(currentPage + 1)}>›</Button>
        <Button variant="outline" size="sm" className="h-8 px-3" disabled={currentPage === totalPages} onClick={() => goTo(totalPages)}>»</Button>
      </div>
    </div>
  );
}
