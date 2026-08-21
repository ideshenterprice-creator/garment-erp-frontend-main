"use client";

import { Eye } from "lucide-react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import type { MockSalesBill } from "@/mock/sales";
import { EmptyState } from "@/components/common/EmptyState";
import { SalesBillStatusBadge } from "@/components/modules/sales/SalesBillStatusBadge";
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
import { formatCurrency } from "@/lib/utils";

interface SalesBillsTableProps {
  bills: MockSalesBill[];
  onAdd?: () => void;
  onSubmit?: (bill: MockSalesBill) => void;
  onRecordPayment?: (bill: MockSalesBill) => void;
}

export function SalesBillsTable({
  bills,
  onAdd,
  onSubmit,
  onRecordPayment,
}: SalesBillsTableProps) {
  const router = useRouter();

  if (bills.length === 0) {
    return (
      <EmptyState
        title="No sales bills found"
        description="Create a new sales bill against a buyer PO."
        actionLabel="+ New Sales Bill"
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
                Invoice ID
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Buyer
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Date
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Amount
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
            {bills.map((bill) => (
              <TableRow key={bill.id}>
                <TableCell className="font-semibold text-slate-900">
                  {bill.invoiceNumber}
                </TableCell>
                <TableCell>{bill.buyer.name}</TableCell>
                <TableCell>
                  {format(new Date(bill.invoiceDate), "MMM dd, yyyy")}
                </TableCell>
                <TableCell className="font-semibold">
                  {formatCurrency(bill.netTotal)}
                </TableCell>
                <TableCell>
                  <SalesBillStatusBadge status={bill.status} />
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      type="button"
                      variant="link"
                      className="h-auto p-0"
                      onClick={() =>
                        router.push(ROUTES.SALES.BILL_DETAIL(bill.id))
                      }
                    >
                      <Eye className="mr-1 size-3.5" />
                      View
                    </Button>
                    {bill.status === "DRAFT" ? (
                      <Button
                        type="button"
                        variant="link"
                        className="h-auto p-0 text-teal-700"
                        onClick={() => onSubmit?.(bill)}
                      >
                        Submit
                      </Button>
                    ) : null}
                    {bill.status === "SUBMITTED" ? (
                      <Button
                        type="button"
                        variant="link"
                        className="h-auto p-0 text-amber-800"
                        onClick={() => onRecordPayment?.(bill)}
                      >
                        Record Payment
                      </Button>
                    ) : null}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center gap-2 border-t border-slate-100 px-4 py-3 text-xs italic text-muted-foreground">
        GST = 0% for all export invoices (Zero Rated)
      </div>
    </div>
  );
}
