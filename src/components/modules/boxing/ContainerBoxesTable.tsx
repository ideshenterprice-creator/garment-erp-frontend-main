import type { BoxPacking } from "@/types";
import { EmptyState } from "@/components/common/EmptyState";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ContainerBoxesTableProps {
  boxes: BoxPacking[];
  onAdd?: () => void;
  canAdd?: boolean;
}

function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function ContainerBoxesTable({
  boxes,
  onAdd,
  canAdd = false,
}: ContainerBoxesTableProps) {
  if (boxes.length === 0) {
    return (
      <EmptyState
        title="No boxes in this container"
        description="Add PACKED boxes from the same purchase order."
        actionLabel={canAdd ? "+ Add Box" : undefined}
        onAction={canAdd ? onAdd : undefined}
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
                Design
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Color
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Total Pieces
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Packed Date
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {boxes.map((box) => (
              <TableRow key={box.id}>
                <TableCell className="font-semibold">{box.boxNumber}</TableCell>
                <TableCell>{box.designNumber}</TableCell>
                <TableCell>{box.color}</TableCell>
                <TableCell>{box.totalPieces}</TableCell>
                <TableCell>{formatDate(box.createdAt)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
