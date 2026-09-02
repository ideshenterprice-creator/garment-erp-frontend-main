"use client";

import { format } from "date-fns";
import { useRouter } from "next/navigation";
import type { ColoringEntry } from "@/types";
import { EmptyState } from "@/components/common/EmptyState";
import { DeleteRowButton } from "@/components/common/DeleteRowButton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ROUTES } from "@/constants/routes";

interface ColoringTableProps {
  entries: ColoringEntry[];
  onAdd?: () => void;
  onDelete?: (entry: ColoringEntry) => void;
}

export function ColoringTable({ entries, onAdd, onDelete }: ColoringTableProps) {
  const router = useRouter();

  if (entries.length === 0) {
    return (
      <EmptyState
        title="No coloring entries found"
        description="Record a coloring entry after printing is complete."
        actionLabel="Record Coloring Entry"
        onAction={onAdd}
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
              <TableHead>Entry No</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>PO</TableHead>
              <TableHead>Bundle</TableHead>
              <TableHead>Color</TableHead>
              <TableHead>Returned</TableHead>
              <TableHead>Rejected</TableHead>
              <TableHead>Karigar</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map((entry) => {
              const bundleNumber = entry.bundle?.bundleNumber;
              return (
                <TableRow
                  key={entry.id}
                  className={bundleNumber ? "cursor-pointer" : undefined}
                  onClick={() => {
                    if (bundleNumber) {
                      router.push(ROUTES.PRODUCTION.BUNDLE_DETAIL(bundleNumber));
                    }
                  }}
                >
                  <TableCell className="font-semibold">
                    {entry.entryNumber}
                  </TableCell>
                  <TableCell>
                    {format(new Date(entry.entryDate), "dd MMM yyyy")}
                  </TableCell>
                  <TableCell>{entry.po?.poNumber ?? entry.poId}</TableCell>
                  <TableCell>{bundleNumber ?? "—"}</TableCell>
                  <TableCell>{entry.colorApplied}</TableCell>
                  <TableCell className="font-semibold">
                    {Number(entry.piecesReturned).toLocaleString("en-IN")}
                  </TableCell>
                  <TableCell className="font-semibold text-red-600">
                    {Number(entry.piecesRejected).toLocaleString("en-IN")}
                  </TableCell>
                  <TableCell>{entry.karigar?.name ?? "—"}</TableCell>
                  <TableCell>
                    <DeleteRowButton
                      onClick={(event) => {
                        event.stopPropagation();
                        onDelete?.(entry);
                      }}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
