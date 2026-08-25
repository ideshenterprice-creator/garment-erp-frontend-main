"use client";

import { useQuery } from "@tanstack/react-query";
import type { SupplierBillPayStatus } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { getParties } from "@/services/masters.service";

export interface SupplierPaymentFilters {
  supplierId: string;
  status: "ALL" | SupplierBillPayStatus;
  from: string;
  to: string;
}

interface SupplierPaymentFilterBarProps {
  filters: SupplierPaymentFilters;
  onChange: (filters: SupplierPaymentFilters) => void;
}

export function SupplierPaymentFilterBar({
  filters,
  onChange,
}: SupplierPaymentFilterBarProps) {
  const suppliersQuery = useQuery({
    queryKey: [...QUERY_KEYS.PARTIES, { type: "SUPPLIER", limit: 100 }],
    queryFn: () => getParties({ type: "SUPPLIER", limit: 100 }),
  });

  const suppliers = suppliersQuery.data?.data.data ?? [];

  return (
    <div className="mb-4 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:flex-wrap sm:items-end">
      <div className="flex min-w-[180px] flex-1 flex-col gap-2">
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
            {suppliers.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex min-w-[160px] flex-1 flex-col gap-2">
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

      <div className="flex min-w-[150px] flex-1 flex-col gap-2">
        <Label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          From
        </Label>
        <Input
          type="date"
          value={filters.from}
          onChange={(event) =>
            onChange({ ...filters, from: event.target.value })
          }
        />
      </div>

      <div className="flex min-w-[150px] flex-1 flex-col gap-2">
        <Label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          To
        </Label>
        <Input
          type="date"
          value={filters.to}
          onChange={(event) =>
            onChange({ ...filters, to: event.target.value })
          }
        />
      </div>

      {(filters.supplierId !== "ALL" ||
        filters.status !== "ALL" ||
        filters.from ||
        filters.to) && (
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            onChange({
              supplierId: "ALL",
              status: "ALL",
              from: "",
              to: "",
            })
          }
        >
          Clear
        </Button>
      )}
    </div>
  );
}
