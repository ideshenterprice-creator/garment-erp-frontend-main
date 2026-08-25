"use client";

import { format } from "date-fns";
import { useRouter } from "next/navigation";
import type { CuttingEntry } from "@/types";
import { EmptyState } from "@/components/common/EmptyState";
import { SizeBreakdownChips } from "@/components/modules/production/SizeBreakdownChips";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ROUTES } from "@/constants/routes";

interface CuttingTableProps {
  entries: CuttingEntry[];
  onAdd?: () => void;
}

export function CuttingTable({ entries, onAdd }: CuttingTableProps) {
  const router = useRouter();

  if (entries.length === 0) {
    return (
      <EmptyState
        title="No cutting entries found"
        description="Record a cutting entry to start production tracking."
        actionLabel="Record Cutting Entry"
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
              <TableHead>Design</TableHead>
              <TableHead>Bundle</TableHead>
              <TableHead>Fabric (kg)</TableHead>
              <TableHead>Pieces</TableHead>
              <TableHead>Sizes</TableHead>
              <TableHead>Wastage (kg)</TableHead>
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
                  <TableCell className="font-semibold text-slate-900">
                    {entry.entryNumber}
                  </TableCell>
                  <TableCell>
                    {format(new Date(entry.entryDate), "dd MMM yyyy")}
                  </TableCell>
                  <TableCell>
                    {entry.po?.poNumber ?? entry.poId}
                  </TableCell>
                  <TableCell>{entry.poItem?.designNumber ?? "—"}</TableCell>
                  <TableCell>{bundleNumber ?? "—"}</TableCell>
                  <TableCell>
                    {Number(entry.fabricIssuedKg).toLocaleString("en-IN")}
                  </TableCell>
                  <TableCell className="font-semibold">
                    {Number(entry.totalPiecesCut).toLocaleString("en-IN")}
                  </TableCell>
                  <TableCell>
                    <SizeBreakdownChips
                      sizes={{
                        qty_0_3M: Number(entry.qty_0_3M),
                        qty_3_6M: Number(entry.qty_3_6M),
                        qty_6_9M: Number(entry.qty_6_9M),
                        qty_9_12M: Number(entry.qty_9_12M),
                        qty_12_18M: Number(entry.qty_12_18M),
                        qty_18_24M: Number(entry.qty_18_24M),
                      }}
                    />
                  </TableCell>
                  <TableCell className="font-semibold text-red-600">
                    {Number(entry.wastageKg).toLocaleString("en-IN")}
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
