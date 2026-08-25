import { format } from "date-fns";
import type { PurchaseRegisterRow } from "@/types";
import { EmptyState } from "@/components/common/EmptyState";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn, formatCurrency } from "@/lib/utils";

interface RegisterTableProps {
  bills: PurchaseRegisterRow[];
  totals: {
    totalQty: number;
    totalAmount: number;
    totalGST: number;
    totalNetTotal: number;
  };
}

function paymentBadgeClass(status: PurchaseRegisterRow["paymentStatus"]) {
  if (status === "PAID") return "bg-emerald-100 text-emerald-700";
  if (status === "PARTIAL") return "bg-amber-100 text-amber-700";
  return "bg-amber-100 text-amber-700";
}

function paymentLabel(status: PurchaseRegisterRow["paymentStatus"]) {
  if (status === "PAID") return "PAID";
  if (status === "PARTIAL") return "PARTIAL";
  return "PENDING";
}

export function RegisterTable({ bills, totals }: RegisterTableProps) {
  if (bills.length === 0) {
    return (
      <EmptyState
        title="No register entries"
        description="Adjust filters to see purchase register data."
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Bill No
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Date
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Supplier
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Fabric Type
              </TableHead>
              <TableHead className="text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                Qty (kg)
              </TableHead>
              <TableHead className="text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                Rate
              </TableHead>
              <TableHead className="text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                Total
              </TableHead>
              <TableHead className="text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                GST
              </TableHead>
              <TableHead className="text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                Net Total
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Payment Status
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bills.map((bill) => (
              <TableRow key={`${bill.billNumber}-${bill.date}`}>
                <TableCell className="font-semibold">{bill.billNumber}</TableCell>
                <TableCell>
                  {format(new Date(bill.date), "dd MMM yyyy")}
                </TableCell>
                <TableCell>{bill.supplier.name}</TableCell>
                <TableCell>{bill.fabricType.name}</TableCell>
                <TableCell className="text-right">
                  {Number(bill.qty).toLocaleString("en-IN")} kg
                </TableCell>
                <TableCell className="text-right">
                  ₹{Number(bill.rate).toLocaleString("en-IN")}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(Number(bill.total))}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(Number(bill.gst))}
                </TableCell>
                <TableCell className="text-right font-semibold">
                  {formatCurrency(Number(bill.netTotal))}
                </TableCell>
                <TableCell>
                  <span
                    className={cn(
                      "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
                      paymentBadgeClass(bill.paymentStatus)
                    )}
                  >
                    {paymentLabel(bill.paymentStatus)}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow className="bg-slate-100 hover:bg-slate-100">
              <TableCell colSpan={4} className="font-bold">
                Totals
              </TableCell>
              <TableCell className="text-right font-bold">
                {Number(totals.totalQty).toLocaleString("en-IN")} kg
              </TableCell>
              <TableCell />
              <TableCell className="text-right font-bold">
                {formatCurrency(Number(totals.totalAmount))}
              </TableCell>
              <TableCell className="text-right font-bold">
                {formatCurrency(Number(totals.totalGST))}
              </TableCell>
              <TableCell className="text-right font-bold">
                {formatCurrency(Number(totals.totalNetTotal))}
              </TableCell>
              <TableCell />
            </TableRow>
          </TableFooter>
        </Table>
      </div>
    </div>
  );
}
