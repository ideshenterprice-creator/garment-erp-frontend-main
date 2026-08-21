"use client";

import type { PaymentStatus } from "@/types";
import {
  accountsKarigars,
  accountsPOs,
} from "@/mock/accounts";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface KarigarPaymentFilters {
  karigarId: string;
  poId: string;
  status: "ALL" | PaymentStatus;
  week: string;
}

interface KarigarPaymentFilterBarProps {
  filters: KarigarPaymentFilters;
  onChange: (filters: KarigarPaymentFilters) => void;
  onApply: () => void;
}

export function KarigarPaymentFilterBar({
  filters,
  onChange,
  onApply,
}: KarigarPaymentFilterBarProps) {
  return (
    <div className="mb-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5 xl:items-end">
        <div className="flex flex-col gap-2">
          <Label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Karigar
          </Label>
          <Select
            value={filters.karigarId}
            onValueChange={(value) =>
              onChange({ ...filters, karigarId: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Karigars</SelectItem>
              {accountsKarigars.map((k) => (
                <SelectItem key={k.id} value={k.id}>
                  {k.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <Label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            PO
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
              {accountsPOs.map((po) => (
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
              onChange({
                ...filters,
                status: value as KarigarPaymentFilters["status"],
              })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Status</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="PAID">Paid</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <Label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Week
          </Label>
          <Select
            value={filters.week}
            onValueChange={(value) => onChange({ ...filters, week: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="42">Week 42 (Current)</SelectItem>
              <SelectItem value="41">Week 41</SelectItem>
              <SelectItem value="40">Week 40</SelectItem>
              <SelectItem value="ALL">All Weeks</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          type="button"
          onClick={onApply}
          className="bg-[#1b3a3a] text-white hover:bg-[#1b3a3a]/90"
        >
          Apply Filter
        </Button>
      </div>
    </div>
  );
}
