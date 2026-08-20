"use client";

import { Filter } from "lucide-react";
import type { ProductionFilters } from "@/mock/production";
import {
  mockProductionKarigars,
  mockProductionPOs,
} from "@/mock/production";
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

interface ProductionFilterBarProps {
  filters: ProductionFilters;
  onChange: (filters: ProductionFilters) => void;
  onApply: () => void;
}

export function ProductionFilterBar({
  filters,
  onChange,
  onApply,
}: ProductionFilterBarProps) {
  return (
    <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4 xl:items-end">
        <div className="flex flex-col gap-2">
          <Label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Purchase Order
          </Label>
          <Select
            value={filters.poId}
            onValueChange={(value) => onChange({ ...filters, poId: value })}
          >
            <SelectTrigger className="bg-white">
              <SelectValue placeholder="All POs" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All POs</SelectItem>
              {mockProductionPOs.map((po) => (
                <SelectItem key={po.id} value={po.id}>
                  {po.poNumber}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <Label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Date Range
          </Label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="date"
              value={filters.dateFrom}
              className="bg-white"
              onChange={(event) =>
                onChange({ ...filters, dateFrom: event.target.value })
              }
            />
            <Input
              type="date"
              value={filters.dateTo}
              className="bg-white"
              onChange={(event) =>
                onChange({ ...filters, dateTo: event.target.value })
              }
            />
          </div>
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
            <SelectTrigger className="bg-white">
              <SelectValue placeholder="All Karigars" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Karigars</SelectItem>
              {mockProductionKarigars.map((party) => (
                <SelectItem key={party.id} value={party.id}>
                  {party.name}
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
          Apply Filters
        </Button>
      </div>
    </div>
  );
}
