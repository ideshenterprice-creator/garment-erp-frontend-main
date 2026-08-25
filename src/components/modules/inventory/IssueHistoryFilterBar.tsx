"use client";

import { Filter } from "lucide-react";
import type { IssueStatus, IssueType, Party, PurchaseOrder } from "@/types";
import { ISSUE_TYPE_OPTIONS } from "@/lib/inventory";
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

export interface IssueHistoryFilters {
  from: string;
  to: string;
  issueType: "ALL" | IssueType;
  karigarId: string;
  poId: string;
  status: "ALL" | IssueStatus;
}

interface IssueHistoryFilterBarProps {
  filters: IssueHistoryFilters;
  onChange: (filters: IssueHistoryFilters) => void;
  onApply: () => void;
  karigars: Party[];
  purchaseOrders: PurchaseOrder[];
  karigarsLoading?: boolean;
  posLoading?: boolean;
}

export function IssueHistoryFilterBar({
  filters,
  onChange,
  onApply,
  karigars,
  purchaseOrders,
  karigarsLoading = false,
  posLoading = false,
}: IssueHistoryFilterBarProps) {
  return (
    <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-7 2xl:items-end">
        <div className="flex flex-col gap-2">
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

        <div className="flex flex-col gap-2">
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
            disabled={karigarsLoading}
          >
            <SelectTrigger>
              <SelectValue
                placeholder={karigarsLoading ? "Loading..." : "All Karigars"}
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Karigars</SelectItem>
              {karigars.map((party) => (
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
            disabled={posLoading}
          >
            <SelectTrigger>
              <SelectValue
                placeholder={posLoading ? "Loading..." : "All POs"}
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All POs</SelectItem>
              {purchaseOrders.map((po) => (
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
                status: value as IssueHistoryFilters["status"],
              })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="ISSUED">Issued</SelectItem>
              <SelectItem value="PARTIAL">Partial</SelectItem>
              <SelectItem value="RETURNED">Returned</SelectItem>
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
