"use client";

import { useQuery } from "@tanstack/react-query";
import type { PaymentStatus } from "@/types";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { lastNWeekOptions } from "@/lib/accounts";
import { getParties } from "@/services/masters.service";
import { getPurchaseOrders } from "@/services/purchaseOrders.service";

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

const weekOptions = lastNWeekOptions(8);

export function KarigarPaymentFilterBar({
  filters,
  onChange,
  onApply,
}: KarigarPaymentFilterBarProps) {
  const karigarsQuery = useQuery({
    queryKey: [...QUERY_KEYS.PARTIES, { type: "KARIGAR", limit: 100 }],
    queryFn: () => getParties({ type: "KARIGAR", limit: 100 }),
  });

  const posQuery = useQuery({
    queryKey: [...QUERY_KEYS.PURCHASE_ORDERS, { limit: 100 }],
    queryFn: () => getPurchaseOrders({ limit: 100 }),
  });

  const karigars = karigarsQuery.data?.data.data ?? [];
  const pos = posQuery.data?.data.data ?? [];

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
              {karigars.map((k) => (
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
              {pos.map((po) => (
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
              <SelectItem value="ALL">All Weeks</SelectItem>
              {weekOptions.map((week) => (
                <SelectItem key={week.value} value={week.value}>
                  {week.label}
                </SelectItem>
              ))}
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
