"use client";

import type { BoxPacking } from "@/types";
import { EmptyState } from "@/components/common/EmptyState";
import { DeleteRowButton } from "@/components/common/DeleteRowButton";
import { BoxStatusBadge } from "@/components/modules/boxing/BoxStatusBadge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface BoxPackingTableProps {
  boxes: BoxPacking[];
  onAdd?: () => void;
  onDelete?: (box: BoxPacking) => void;
}

export function BoxPackingTable({ boxes, onAdd, onDelete }: BoxPackingTableProps) {
  if (boxes.length === 0) {
    return (
      <EmptyState
        title="No boxes found"
        description="Create a new box entry to start packing finished garments."
        actionLabel="+ New Box Entry"
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
                Box No
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                PO
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Design
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Color
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                0-3M
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                3-6M
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                6-9M
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                9-12M
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                12-18M
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                18-24M
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Total
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Ctn No
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
            {boxes.map((box) => (
              <TableRow key={box.id}>
                <TableCell className="font-semibold text-slate-900">
                  {box.boxNumber}
                </TableCell>
                <TableCell>{box.po?.poNumber ?? box.poId}</TableCell>
                <TableCell>{box.designNumber}</TableCell>
                <TableCell>{box.color}</TableCell>
                <TableCell>{box.qty_0_3M}</TableCell>
                <TableCell>{box.qty_3_6M}</TableCell>
                <TableCell>{box.qty_6_9M}</TableCell>
                <TableCell>{box.qty_9_12M}</TableCell>
                <TableCell>{box.qty_12_18M}</TableCell>
                <TableCell>{box.qty_18_24M}</TableCell>
                <TableCell className="font-semibold">
                  {box.totalPieces} pcs
                </TableCell>
                <TableCell>
                  {box.container?.containerNumber ?? "—"}
                </TableCell>
                <TableCell>
                  <BoxStatusBadge status={box.status} />
                </TableCell>
                <TableCell>
                  <DeleteRowButton onClick={() => onDelete?.(box)} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
