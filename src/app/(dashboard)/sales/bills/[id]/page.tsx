"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
import { QUERY_KEYS } from "@/constants/queryKeys";
import { ROUTES } from "@/constants/routes";
import { getErrorMessage } from "@/lib/errorHandler";
import { formatCurrency } from "@/lib/utils";
import {
  getSalesBillById,
  returnSalesBill,
} from "@/services/sales.service";

export default function SalesBillDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const billId = typeof params.id === "string" ? params.id : "";
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [returnOpen, setReturnOpen] = useState(false);

  const billQuery = useQuery({
    queryKey: [...QUERY_KEYS.SALES_BILLS, billId],
    queryFn: () => getSalesBillById(billId),
    enabled: Boolean(billId),
  });

  const returnMutation = useMutation({
    mutationFn: (reason: string) => returnSalesBill(billId, reason),
    onSuccess: () => {
      toast.success("Bill returned.");
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SALES_BILLS });
      setReturnOpen(false);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to return bill."));
    },
  });

  if (billQuery.isLoading) return <TableSkeleton rows={8} />;

  if (billQuery.isError || !billQuery.data?.data) {
    return (
      <EmptyState
        title="Invoice not found"
        description="This sales bill does not exist or failed to load."
        actionLabel="Back to Sales Bills"
        onAction={() => router.push(ROUTES.SALES.BILLS)}
      />
    );
  }

  const bill = billQuery.data.data;
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
              {bill.buyer?.name}
            </button>
            {bill.buyer?.city ? `, ${bill.buyer.city}` : ""} —{" "}
            <button
              type="button"
              className="font-medium text-[#1b3a3a] hover:underline"
              onClick={() =>
                router.push(ROUTES.PURCHASE_ORDERS.DETAIL(bill.poId))
              }
            >
              {bill.po?.poNumber}
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
          {bill.status !== "RETURNED" ? (
            <Button
              type="button"
              variant="outline"
              className="border-red-200 text-red-600 hover:bg-red-50"
              onClick={() => setReturnOpen(true)}
            >
              <Undo2 className="size-4" />
              Return Bill
            </Button>
          ) : null}
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
                  <TableHead>Size</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Unit Price</TableHead>
                  <TableHead>Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-muted-foreground">
                      No line items on this invoice.
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <p className="font-medium">{item.garmentType}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.designNumber} · {item.color}
                        </p>
                      </TableCell>
                      <TableCell>{item.size}</TableCell>
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
              {formatCurrency(Number(bill.netTotal))}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Subtotal {formatCurrency(Number(bill.subTotal))} · GST{" "}
              {formatCurrency(Number(bill.gstAmount))}
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
        billId={bill.id}
        onClose={() => setPaymentOpen(false)}
      />

      <ReturnBillDialog
        open={returnOpen}
        invoiceNumber={bill.invoiceNumber}
        onClose={() => setReturnOpen(false)}
        onConfirm={(reason) => returnMutation.mutate(reason)}
      />
    </div>
  );
}
