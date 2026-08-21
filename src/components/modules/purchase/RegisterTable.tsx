import { format } from "date-fns";
import type { MockPurchaseBill } from "@/mock/purchase";
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
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface RegisterTableProps {
  bills: MockPurchaseBill[];
  /** When paginating, pass the full filtered set so footer totals stay correct. */
  totalsFrom?: MockPurchaseBill[];
}

export function RegisterTable({ bills, totalsFrom }: RegisterTableProps) {
  if (bills.length === 0) {
    return (
      <EmptyState
        title="No register entries"
        description="Adjust filters to see purchase register data."
      />
    );
  }

  const totalsSource = totalsFrom ?? bills;
  const totals = totalsSource.reduce(
    (acc, bill) => ({
      netWeight: acc.netWeight + bill.netWeight,
      totalAmount: acc.totalAmount + bill.totalAmount,
      amountPaid: acc.amountPaid + bill.amountPaid,
      outstanding:
        acc.outstanding + Math.max(0, bill.totalAmount - bill.amountPaid),
    }),
    { netWeight: 0, totalAmount: 0, amountPaid: 0, outstanding: 0 }
  );

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
                Fabric
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Linked PO
              </TableHead>
              <TableHead className="text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                Qty (kg)
              </TableHead>
              <TableHead className="text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                Amount
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Payment Status
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bills.map((bill) => {
              const outstanding = Math.max(0, bill.totalAmount - bill.amountPaid);
              const paid = outstanding === 0 && bill.amountPaid > 0;
              return (
                <TableRow key={bill.id}>
                  <TableCell className="font-semibold">{bill.billNumber}</TableCell>
                  <TableCell>
                    {format(new Date(bill.purchaseDate), "dd MMM yyyy")}
                  </TableCell>
                  <TableCell>{bill.supplier.name}</TableCell>
                  <TableCell>{bill.fabricLabel}</TableCell>
                  <TableCell>{bill.po.poNumber}</TableCell>
                  <TableCell className="text-right">
                    {bill.netWeight.toLocaleString("en-IN")}
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {formatCurrency(bill.totalAmount)}
                  </TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
                        paid
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                      )}
                    >
                      {paid ? "PAID" : "PENDING"}
                    </span>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
          <TableFooter>
            <TableRow className="bg-slate-50 hover:bg-slate-50">
              <TableCell colSpan={5} className="font-semibold">
                Totals
              </TableCell>
              <TableCell className="text-right font-semibold">
                {totals.netWeight.toLocaleString("en-IN")}
              </TableCell>
              <TableCell className="text-right font-semibold">
                {formatCurrency(totals.totalAmount)}
              </TableCell>
              <TableCell className="font-semibold text-slate-600">
                Outstanding {formatCurrency(totals.outstanding)}
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>
    </div>
  );
}
