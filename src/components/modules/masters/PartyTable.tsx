"use client";

import { Pencil, Trash2 } from "lucide-react";
import type { Party } from "@/types";
import { StatusBadge } from "@/components/common/StatusBadge";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface PartyTableProps {
  parties: Party[];
  onRowClick: (party: Party) => void;
  onEdit: (party: Party) => void;
  onDelete: (party: Party) => void;
  onAdd?: () => void;
}

function typeVariant(type: Party["type"]) {
  if (type === "BUYER") return "buyer" as const;
  if (type === "SUPPLIER") return "supplier" as const;
  return "karigar" as const;
}

function typeLabel(type: Party["type"]) {
  if (type === "BUYER") return "Buyer";
  if (type === "SUPPLIER") return "Supplier";
  return "Karigar";
}

export function PartyTable({
  parties,
  onRowClick,
  onEdit,
  onDelete,
  onAdd,
}: PartyTableProps) {
  if (parties.length === 0) {
    return (
      <EmptyState
        title="No parties found"
        description="Try changing filters or add a new party."
        actionLabel="Add Party"
        onAction={onAdd}
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Party Name
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Type
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Contact
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                GST Number
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                City
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Status
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {parties.map((party) => (
              <TableRow
                key={party.id}
                className="cursor-pointer"
                onClick={() => onRowClick(party)}
              >
                <TableCell className="font-medium text-slate-900">
                  {party.name}
                </TableCell>
                <TableCell>
                  <StatusBadge
                    label={typeLabel(party.type)}
                    variant={typeVariant(party.type)}
                  />
                </TableCell>
                <TableCell className="text-slate-600">{party.contact}</TableCell>
                <TableCell className="text-slate-600">
                  {party.gstNumber || "N/A"}
                </TableCell>
                <TableCell className="text-slate-600">{party.city}</TableCell>
                <TableCell>
                  <StatusBadge
                    label={party.isActive ? "ACTIVE" : "INACTIVE"}
                    variant={party.isActive ? "active" : "inactive"}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-0.5">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-8 text-slate-500"
                      onClick={(event) => {
                        event.stopPropagation();
                        onEdit(party);
                      }}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-8 text-red-500 hover:bg-red-50 hover:text-red-600"
                      onClick={(event) => {
                        event.stopPropagation();
                        onDelete(party);
                      }}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
