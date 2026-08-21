"use client";

import { RefreshCw } from "lucide-react";
import type { SupplierPaymentStatus } from "@/mock/accounts";
import { accountsSuppliers } from "@/mock/accounts";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface SupplierPaymentFilters {
  supplierId: string;
  status: "ALL" | SupplierPaymentStatus;
  dateRange: string;
}

interface SupplierPaymentFilterBarProps {
  filters: SupplierPaymentFilters;
  onChange: (filters: SupplierPaymentFilters) => void;
  onApply: () => void;
  onReset?: () => void;
}

export function SupplierPaymentFilterBar({
  filters,
  onChange,
  onApply,
  onReset,
}: SupplierPaymentFilterBarProps) {
  return (
    <div className="mb-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5 xl:items-end">
        <div className="flex flex-col gap-2">
          <Label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Supplier
          </Label>
          <Select
            value={filters.supplierId}
            onValueChange={(value) =>
              onChange({ ...filters, supplierId: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Suppliers</SelectItem>
              {accountsSuppliers.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
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
              onChange({
                ...filters,
                status: value as SupplierPaymentFilters["status"],
              })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All</SelectItem>
              <SelectItem value="PAID">Paid</SelectItem>
              <SelectItem value="PARTIAL">Partial</SelectItem>
              <SelectItem value="UNPAID">Unpaid</SelectItem>
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
          Apply
        </Button>
        <Button type="button" variant="outline" size="icon" onClick={onReset}>
          <RefreshCw className="size-4" />
        </Button>
      </div>
    </div>
  );
}
