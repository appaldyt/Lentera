"use client";

import React from "react";
import { TaskFilters, TaskItem } from "./types";
import { Search, X, Filter } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface TaskFilterBarProps {
  tasks: TaskItem[];
  filters: TaskFilters;
  onFilterChange: (filters: TaskFilters) => void;
  onReset: () => void;
}

export function TaskFilterBar({
  tasks,
  filters,
  onFilterChange,
  onReset,
}: TaskFilterBarProps) {
  // Extract unique categories & PICs from existing tasks
  const uniqueCategories = Array.from(
    new Set(tasks.map((t) => t.category).filter(Boolean))
  );

  const uniquePics = Array.from(
    new Set(tasks.map((t) => t.picName).filter(Boolean) as string[])
  );

  const hasActiveFilters =
    filters.search !== "" ||
    filters.priority !== "ALL" ||
    filters.category !== "ALL" ||
    filters.pic !== "ALL";

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-surface border border-border shadow-2xs">
      <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
          <input
            type="text"
            placeholder="Cari tugas, deskripsi, atau PIC..."
            value={filters.search}
            onChange={(e) =>
              onFilterChange({ ...filters, search: e.target.value })
            }
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-border bg-slate-50/50 focus:bg-surface focus:outline-none focus:ring-1 focus:ring-sky"
          />
          {filters.search && (
            <button
              onClick={() => onFilterChange({ ...filters, search: "" })}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-secondary hover:text-navy"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Priority Filter */}
        <div className="w-36">
          <Select
            value={filters.priority}
            onValueChange={(val) =>
              onFilterChange({ ...filters, priority: val })
            }
          >
            <SelectTrigger className="h-8 text-xs bg-slate-50/50 border-border">
              <SelectValue placeholder="Prioritas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Semua Prioritas</SelectItem>
              <SelectItem value="URGENT">🔴 Urgent</SelectItem>
              <SelectItem value="HIGH">🟠 Tinggi</SelectItem>
              <SelectItem value="MEDIUM">🔵 Sedang</SelectItem>
              <SelectItem value="LOW">⚪ Rendah</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Category Filter */}
        <div className="w-38">
          <Select
            value={filters.category}
            onValueChange={(val) =>
              onFilterChange({ ...filters, category: val })
            }
          >
            <SelectTrigger className="h-8 text-xs bg-slate-50/50 border-border">
              <SelectValue placeholder="Kategori" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Semua Kategori</SelectItem>
              {uniqueCategories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* PIC Filter */}
        <div className="w-38">
          <Select
            value={filters.pic}
            onValueChange={(val) => onFilterChange({ ...filters, pic: val })}
          >
            <SelectTrigger className="h-8 text-xs bg-slate-50/50 border-border">
              <SelectValue placeholder="PIC" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Semua PIC</SelectItem>
              {uniquePics.map((pic) => (
                <SelectItem key={pic} value={pic}>
                  {pic}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Reset Filter Button */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          className="text-xs h-8 text-text-secondary hover:text-red-600 gap-1"
        >
          <X className="w-3.5 h-3.5" /> Reset Filter
        </Button>
      )}
    </div>
  );
}
