"use client";

import { useQuery } from "@tanstack/react-query";
import type { Party } from "@/types";
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

function partyTypeBadge(type: Party["type"]): string {
  return type.charAt(0) + type.slice(1).toLowerCase();
}

export function AccountStatementFilter({
  filters,
  onChange,
  onShow,
}: AccountStatementFilterProps) {
  const partiesQuery = useQuery({
    queryKey: [...QUERY_KEYS.PARTIES, { limit: 200 }],
    queryFn: () => getParties({ limit: 200 }),
  });

  const parties = partiesQuery.data?.data.data ?? [];

  return (
    <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4 xl:items-end">
        <div className="flex flex-col gap-2">
          <Label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Party Name
          </Label>
          <Select
            value={filters.partyId || undefined}
            onValueChange={(value) =>
              onChange({ ...filters, partyId: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select party" />
            </SelectTrigger>
            <SelectContent>
              {parties.map((party) => (
                <SelectItem key={party.id} value={party.id}>
                  <span className="inline-flex items-center gap-2">
                    {party.name}
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-slate-500">
                      {partyTypeBadge(party.type)}
                    </span>
                  </span>
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
          Show Statement
        </Button>
      </div>
    </div>
  );
}
