"use client";

import { Filter } from "lucide-react";
import type { IssueType } from "@/types";
import { ISSUE_TYPE_OPTIONS, mockKarigarParties } from "@/mock/inventory";
import { mockPurchaseOrders } from "@/mock/purchaseOrders";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface IssueHistoryFilters {
  dateRange: string;
  issueType: "ALL" | IssueType;
  karigarId: string;
  poId: string;
}

interface IssueHistoryFilterBarProps {
  filters: IssueHistoryFilters;
  onChange: (filters: IssueHistoryFilters) => void;
  onApply: () => void;
}

export function IssueHistoryFilterBar({
  filters,
  onChange,
  onApply,
}: IssueHistoryFilterBarProps) {
  return (
    <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5 xl:items-end">
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
              <SelectItem value="THIS_QUARTER">This Quarter</SelectItem>
              <SelectItem value="ALL">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <Label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Issue Type
          </Label>
          <Select
            value={filters.issueType}
            onValueChange={(value) =>
              onChange({
                ...filters,
                issueType: value as IssueHistoryFilters["issueType"],
              })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Types</SelectItem>
              {ISSUE_TYPE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

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
              {mockKarigarParties.map((party) => (
                <SelectItem key={party.id} value={party.id}>
                  {party.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

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
          Apply
        </Button>
      </div>
    </div>
  );
}
