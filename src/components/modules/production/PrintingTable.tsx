"use client";

import { format } from "date-fns";
import { useRouter } from "next/navigation";
import type { PrintingEntry } from "@/types";
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

interface PrintingTableProps {
  entries: PrintingEntry[];
  onAdd?: () => void;
}

export function PrintingTable({ entries, onAdd }: PrintingTableProps) {
  const router = useRouter();

  if (entries.length === 0) {
    return (
      <EmptyState
        title="No printing entries found"
        description="Record a printing entry after cutting is complete."
        actionLabel="Record Printing Entry"
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
              <TableHead>Received</TableHead>
              <TableHead>Returned</TableHead>
              <TableHead>Rejected</TableHead>
              <TableHead>Karigar</TableHead>
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
                  <TableCell>
                    {Number(entry.piecesReceived).toLocaleString("en-IN")}
                  </TableCell>
                  <TableCell className="font-semibold">
                    {Number(entry.piecesReturned).toLocaleString("en-IN")}
                  </TableCell>
                  <TableCell className="font-semibold text-red-600">
                    {Number(entry.piecesRejected).toLocaleString("en-IN")}
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
