"use client";

import { Filter } from "lucide-react";
import { mockPurchaseOrders } from "@/mock/purchaseOrders";
import { salesBuyers } from "@/mock/sales";
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

export interface SalesRegisterFilters {
  fromDate: string;
  toDate: string;
  buyerId: string;
  poId: string;
}

interface SalesRegisterFilterBarProps {
  filters: SalesRegisterFilters;
  onChange: (filters: SalesRegisterFilters) => void;
  onApply: () => void;
}

export function SalesRegisterFilterBar({
  filters,
  onChange,
  onApply,
}: SalesRegisterFilterBarProps) {
  return (
    <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5 xl:items-end">
        <div className="flex flex-col gap-2">
          <Label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            From
          </Label>
          <Input
            type="date"
            value={filters.fromDate}
            onChange={(event) =>
              onChange({ ...filters, fromDate: event.target.value })
            }
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            To
          </Label>
          <Input
            type="date"
            value={filters.toDate}
            onChange={(event) =>
              onChange({ ...filters, toDate: event.target.value })
            }
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Buyer
          </Label>
          <Select
            value={filters.buyerId}
            onValueChange={(value) =>
              onChange({ ...filters, buyerId: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Buyers</SelectItem>
              {salesBuyers.map((buyer) => (
                <SelectItem key={buyer.id} value={buyer.id}>
                  {buyer.name}
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
              {mockPurchaseOrders.map((po) => (
                <SelectItem key={po.id} value={po.id}>
                  {po.poNumber}
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
          <Filter className="size-4" />
          Apply Filter
        </Button>
      </div>
    </div>
  );
}
