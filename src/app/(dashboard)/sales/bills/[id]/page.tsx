"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Download,
  FilePlus2,
  Undo2,
  List,
  MapPin,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { mockSalesBills, type MockSalesBill } from "@/mock/sales";
import { TableSkeleton } from "@/components/common/LoadingSpinner";
import { EmptyState } from "@/components/common/EmptyState";
import { BillDetailCard } from "@/components/modules/sales/BillDetailCard";
import { BillPaymentCard } from "@/components/modules/sales/BillPaymentCard";
import { RecordPaymentDrawer } from "@/components/modules/sales/RecordPaymentDrawer";
import { ReturnBillDialog } from "@/components/modules/sales/ReturnBillDialog";
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

export default function SalesBillDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [bills, setBills] = useState<MockSalesBill[]>(mockSalesBills);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [returnOpen, setReturnOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 350);
    return () => clearTimeout(timer);
  }, []);

  const bill = useMemo(
    () => bills.find((item) => item.id === params.id),
    [bills, params.id]
  );

  if (loading) return <TableSkeleton rows={8} />;

  if (!bill) {
    return (
      <EmptyState
        title="Invoice not found"
        description="This sales bill does not exist."
        actionLabel="Back to Sales Bills"
        onAction={() => router.push(ROUTES.SALES.BILLS)}
      />
    );
  }

  const items = bill.items ?? [];

  return (
    <div>
      <div className="mb-4">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => router.push(ROUTES.SALES.BILLS)}
        >
          <ArrowLeft className="size-4" />
          Back
        </Button>
      </div>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="inline-flex flex-wrap items-center gap-2 text-2xl font-bold tracking-tight text-slate-900 md:text-[28px]">
            Invoice — {bill.invoiceNumber}
            <SalesBillStatusBadge status={bill.status} />
          </h1>
          <p className="mt-1 flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="size-3.5" />
            <button
              type="button"
              className="font-medium text-[#1b3a3a] hover:underline"
              onClick={() => router.push(`/masters/party/${bill.buyerId}`)}
            >
              {bill.buyer.name}
            </button>
            , {bill.buyer.city} —{" "}
            <button
              type="button"
              className="font-medium text-[#1b3a3a] hover:underline"
              onClick={() =>
                router.push(ROUTES.PURCHASE_ORDERS.DETAIL(bill.poId))
              }
            >
              {bill.po.poNumber}
            </button>{" "}
            — {format(new Date(bill.invoiceDate), "dd MMM yyyy")}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => toast.message("PDF download coming soon")}
          >
            <Download className="size-4" />
            Download PDF
          </Button>
          {bill.status === "SUBMITTED" || bill.status === "PAID" ? (
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                router.push(`${ROUTES.SALES.NOTES}?billId=${bill.id}`)
              }
            >
              <FilePlus2 className="size-4" />
              Raise Credit/Debit Note
            </Button>
          ) : null}
          <Button
            type="button"
            variant="outline"
            className="border-red-200 text-red-600 hover:bg-red-50"
            onClick={() => setReturnOpen(true)}
          >
            <Undo2 className="size-4" />
            Return Bill
          </Button>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <BillDetailCard bill={bill} />

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <List className="size-4 text-slate-500" />
              <h2 className="text-base font-semibold text-slate-900">
                Bill Items
              </h2>
            </div>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
              {items.length} Items
            </span>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item Description</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Unit Price</TableHead>
                  <TableHead>Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-muted-foreground">
                      No line items on this invoice.
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <p className="font-medium">{item.garmentType}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.designNumber}
                        </p>
                      </TableCell>
                      <TableCell>
                        {item.quantity.toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(item.ratePerPiece)}
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(item.amount)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          <div className="mt-4 rounded-lg bg-slate-50 px-4 py-3 text-right">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Net Amount Payable
            </p>
            <p className="text-2xl font-bold text-slate-900">
              {formatCurrency(bill.netTotal)}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-5">
        <BillPaymentCard
          bill={bill}
          onRecordPayment={() => setPaymentOpen(true)}
        />
      </div>

      <RecordPaymentDrawer
        open={paymentOpen}
        bill={bill}
        onClose={() => setPaymentOpen(false)}
        onSave={(values) => {
          setBills((prev) =>
            prev.map((item) => {
              if (item.id !== bill.id) return item;
              const amountReceived = item.amountReceived + values.amountReceived;
              return {
                ...item,
                amountReceived,
                status:
                  amountReceived >= item.netTotal ? "PAID" : item.status,
                payments: [
                  ...item.payments,
                  {
                    id: `pay-${Date.now()}`,
                    salesBillId: item.id,
                    date: values.paymentDate,
                    method: values.paymentMode,
                    amount: values.amountReceived,
                    referenceNo: values.referenceNo ?? "",
                    processedBy: "Raj Sharma",
                    status: "SUCCESS",
                  },
                ],
              };
            })
          );
        }}
      />

      <ReturnBillDialog
        open={returnOpen}
        invoiceNumber={bill.invoiceNumber}
        onClose={() => setReturnOpen(false)}
        onConfirm={() => {
          setBills((prev) =>
            prev.map((item) =>
              item.id === bill.id ? { ...item, status: "RETURNED" } : item
            )
          );
          toast.success("Bill returned successfully");
        }}
      />
    </div>
  );
}
