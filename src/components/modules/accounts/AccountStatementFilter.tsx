"use client";

import { Eye } from "lucide-react";
import { accountsParties } from "@/mock/accounts";
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

export interface StatementFilters {
  partyId: string;
  fromDate: string;
  toDate: string;
}

interface AccountStatementFilterProps {
  filters: StatementFilters;
  onChange: (filters: StatementFilters) => void;
  onShow: () => void;
}

export function AccountStatementFilter({
  filters,
  onChange,
  onShow,
}: AccountStatementFilterProps) {
  return (
    <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4 xl:items-end">
        <div className="flex flex-col gap-2">
          <Label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Party Name
          </Label>
          <Select
            value={filters.partyId}
            onValueChange={(value) =>
              onChange({ ...filters, partyId: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select party" />
            </SelectTrigger>
            <SelectContent>
              {accountsParties.map((party) => (
                <SelectItem key={party.id} value={party.id}>
                  {party.name}
                  {party.name === "Al Reem" ? " Trading" : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-2">
          <Label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            From Date
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
            To Date
          </Label>
          <Input
            type="date"
            value={filters.toDate}
            onChange={(event) =>
              onChange({ ...filters, toDate: event.target.value })
            }
          />
        </div>
        <Button
          type="button"
          onClick={onShow}
          className="bg-[#1b3a3a] text-white hover:bg-[#1b3a3a]/90"
        >
          <Eye className="size-4" />
          Show Statement
        </Button>
      </div>
    </div>
  );
}
