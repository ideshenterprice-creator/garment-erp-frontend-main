"use client";

import { format } from "date-fns";
import { useRouter } from "next/navigation";
import type { StitchingEntry } from "@/types";
import { EmptyState } from "@/components/common/EmptyState";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ROUTES } from "@/constants/routes";
import { formatCurrency } from "@/lib/utils";

interface StitchingTableProps {
  entries: StitchingEntry[];
  onAdd?: () => void;
}

export function StitchingTable({ entries, onAdd }: StitchingTableProps) {
  const router = useRouter();

  if (entries.length === 0) {
    return (
      <EmptyState
        title="No stitching entries found"
        description="Record stitching work after coloring is complete."
        actionLabel="Record Stitching Entry"
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
              <TableHead>Operation</TableHead>
              <TableHead>Returned</TableHead>
              <TableHead>Rejected</TableHead>
              <TableHead>Amount Due</TableHead>
              <TableHead>Karigar</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map((entry) => {
              const bundleNumber = entry.bundle?.bundleNumber;
              const rate = Number(entry.operation?.ratePerPiece ?? 0);
              const amountDue = Number(entry.piecesReturned) * rate;
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
                  <TableCell>
                    <span className="inline-flex rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-medium text-sky-700">
                      {entry.operation?.name ?? "—"}
                    </span>
                  </TableCell>
                  <TableCell className="font-semibold">
                    {Number(entry.piecesReturned).toLocaleString("en-IN")}
                  </TableCell>
                  <TableCell className="font-semibold text-red-600">
                    {Number(entry.piecesRejected).toLocaleString("en-IN")}
                  </TableCell>
                  <TableCell className="font-semibold">
                    {formatCurrency(amountDue)}
                  </TableCell>
                  <TableCell>{entry.karigar?.name ?? "—"}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
