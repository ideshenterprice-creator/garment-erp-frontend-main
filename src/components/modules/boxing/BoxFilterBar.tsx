"use client";

import { Filter } from "lucide-react";
import type { BoxStatus } from "@/mock/boxing";
import { boxingPOs } from "@/mock/boxing";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface BoxFilters {
  poId: string;
  status: "ALL" | BoxStatus;
  dateRange: string;
}

interface BoxFilterBarProps {
  filters: BoxFilters;
  onChange: (filters: BoxFilters) => void;
  onApply: () => void;
}

export function BoxFilterBar({ filters, onChange, onApply }: BoxFilterBarProps) {
  return (
    <div className="mb-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4 xl:items-end">
        <div className="flex flex-col gap-2">
          <Label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Purchase Order
          </Label>
          <Select
            value={filters.poId}
            onValueChange={(value) => onChange({ ...filters, poId: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All POs</SelectItem>
              {boxingPOs.map((po) => (
                <SelectItem key={po.id} value={po.id}>
                  {po.poNumber}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <Label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Status
          </Label>
          <Select
            value={filters.status}
            onValueChange={(value) =>
              onChange({ ...filters, status: value as BoxFilters["status"] })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="LOADED">Loaded</SelectItem>
              <SelectItem value="PACKED">Packed</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <Label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Date Range
          </Label>
          <Select
            value={filters.dateRange}
            onValueChange={(value) =>
              onChange({ ...filters, dateRange: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="THIS_MONTH">This Month</SelectItem>
              <SelectItem value="LAST_MONTH">Last Month</SelectItem>
              <SelectItem value="ALL">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          type="button"
          onClick={onApply}
          className="bg-[#1b3a3a] text-white hover:bg-[#1b3a3a]/90"
        >
          <Filter className="size-4" />
          Apply Filter
        </Button>
      </div>
    </div>
  );
}
