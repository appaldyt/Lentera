"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Search, Filter, X, Download } from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTransition, useState } from "react";

export function SearchFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // States for filter dropdowns
  const [filterYear, setFilterYear] = useState(searchParams.get("year") || "ALL");
  const [filterMonth, setFilterMonth] = useState(searchParams.get("month") || "ALL");

  const monthNames = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember",
  ];
  const uniqueYears = [2024, 2025, 2026, 2027];

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    applyFilters(value, filterYear, filterMonth);
  };

  const applyFilters = (search: string, year: string, month: string) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams);
      if (search) params.set("search", search);
      else params.delete("search");

      if (year !== "ALL") params.set("year", year);
      else params.delete("year");

      if (month !== "ALL") params.set("month", month);
      else params.delete("month");

      params.delete("page");

      router.replace(`${pathname}?${params.toString()}`);
    });
  };

  const handleApply = () => {
    applyFilters(searchQuery, filterYear, filterMonth);
    setIsFilterOpen(false);
  };

  const handleClear = () => {
    setFilterYear("ALL");
    setFilterMonth("ALL");
    applyFilters(searchQuery, "ALL", "ALL");
    setIsFilterOpen(false);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto items-center">
      <div className="relative w-full sm:w-80">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
        <Input
          type="search"
          placeholder="Cari NIK, Nama Karyawan, atau Training..."
          className="pl-9 bg-background/50 border-border/50"
          value={searchQuery}
          onChange={handleSearch}
        />
      </div>

      <div className="relative flex items-center gap-2 w-full sm:w-auto">
        <Button 
          variant="outline" 
          className="gap-2 border-sky/30 text-sky bg-white hover:bg-sky/5 w-full sm:w-auto" 
          onClick={() => setIsFilterOpen(!isFilterOpen)}
        >
          <Filter className="h-4 w-4" /> Filter
        </Button>
        <a href={`/api/export/training-history?${searchParams.toString()}`}>
          <Button variant="outline" className="gap-2 border-sky/30 text-sky bg-white hover:bg-sky/5 w-full sm:w-auto">
            <Download className="h-4 w-4" /> Export
          </Button>
        </a>

        {isFilterOpen && (
          <Card className="absolute right-0 top-[calc(100%+8px)] w-72 z-50 p-4 shadow-xl border-border animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-navy text-sm flex items-center gap-2">
                <Filter className="h-4 w-4" /> Filter Data
              </h4>
              <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full" onClick={() => setIsFilterOpen(false)}>
                <X className="h-3 w-3" />
              </Button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-text-secondary">Tahun Pelaksanaan</label>
                <select 
                  className="flex h-9 w-full rounded-md border border-border bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky" 
                  value={filterYear} 
                  onChange={(e) => setFilterYear(e.target.value)}
                >
                  <option value="ALL">Semua Tahun</option>
                  {uniqueYears.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-text-secondary">Bulan</label>
                <select 
                  className="flex h-9 w-full rounded-md border border-border bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky" 
                  value={filterMonth} 
                  onChange={(e) => setFilterMonth(e.target.value)}
                >
                  <option value="ALL">Semua Bulan</option>
                  {monthNames.map((m, i) => <option key={i} value={(i + 1).toString()}>{m}</option>)}
                </select>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <Button variant="outline" className="flex-1 text-xs" onClick={handleClear}>Clear</Button>
              <Button className="flex-1 bg-sky hover:bg-sky/90 text-white text-xs" onClick={handleApply}>Terapkan</Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
