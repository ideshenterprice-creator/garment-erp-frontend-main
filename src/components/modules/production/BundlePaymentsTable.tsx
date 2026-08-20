import type { BundlePaymentRow } from "@/mock/production";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn, formatCurrency } from "@/lib/utils";

interface BundlePaymentsTableProps {
  payments: BundlePaymentRow[];
}

export function BundlePaymentsTable({ payments }: BundlePaymentsTableProps) {
  const total = payments.reduce((sum, row) => sum + row.amount, 0);

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
            <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Karigar
            </TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Operation
            </TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Pieces
            </TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Rate
            </TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Amount
            </TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Status
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.map((row) => (
            <TableRow key={row.id}>
              <TableCell>{row.karigarName}</TableCell>
              <TableCell>{row.operationName}</TableCell>
              <TableCell>{row.pieces.toLocaleString("en-IN")}</TableCell>
              <TableCell>₹{row.ratePerPiece.toFixed(2)}</TableCell>
              <TableCell className="font-medium">
                {formatCurrency(row.amount)}
              </TableCell>
              <TableCell>
                <span
                  className={cn(
                    "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase",
                    row.status === "PAID"
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-amber-50 text-amber-800"
                  )}
                >
                  {row.status}
                </span>
              </TableCell>
            </TableRow>
          ))}
          <TableRow className="bg-slate-50 hover:bg-slate-50">
            <TableCell colSpan={4} className="font-bold text-slate-900">
              Total Payment for this Bundle
            </TableCell>
            <TableCell colSpan={2} className="font-bold text-slate-900">
              {formatCurrency(total)}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}
