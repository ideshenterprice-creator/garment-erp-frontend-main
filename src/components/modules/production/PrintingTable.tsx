"use client";

import { Eye } from "lucide-react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import type { MockPrintingEntry } from "@/mock/production";
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
import { ROUTES } from "@/constants/routes";

interface PrintingTableProps {
  entries: MockPrintingEntry[];
  onAdd?: () => void;
}

export function PrintingTable({ entries, onAdd }: PrintingTableProps) {
  const router = useRouter();

  if (entries.length === 0) {
    return (
      <EmptyState
        title="No printing entries found"
        description="Record a printing entry after cutting is complete."
        actionLabel="+ Record Printing Entry"
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
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Entry No
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Date
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                PO
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Design
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Bundle
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Received
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Returned
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Rejected
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Karigar
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell className="font-semibold text-slate-900">
                  {entry.entryNumber}
                </TableCell>
                <TableCell>
                  {format(new Date(entry.entryDate), "dd MMM yyyy")}
                </TableCell>
                <TableCell>{entry.poNumber}</TableCell>
                <TableCell>{entry.designNumber}</TableCell>
                <TableCell>{entry.bundleNumber}</TableCell>
                <TableCell>
                  {entry.piecesReceived.toLocaleString("en-IN")} pcs
                </TableCell>
                <TableCell>
                  {entry.piecesReturned.toLocaleString("en-IN")} pcs
                </TableCell>
                <TableCell className="font-semibold text-red-600">
                  {entry.piecesRejected.toLocaleString("en-IN")} pcs
                </TableCell>
                <TableCell>{entry.karigarName}</TableCell>
                <TableCell>
                  <Button
                    type="button"
                    variant="link"
                    className="h-auto p-0 text-teal-700"
                    onClick={() =>
                      router.push(
                        ROUTES.PRODUCTION.BUNDLE_DETAIL(entry.bundleNumber)
                      )
                    }
                  >
                    <Eye className="mr-1 size-3.5" />
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
