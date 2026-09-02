"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { FileText, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { SalesBill } from "@/types";
import {
  ConfirmDialog,
  PERMANENT_DELETE,
} from "@/components/common/ConfirmDialog";
import { PageHeader, PageHeaderAction } from "@/components/common/PageHeader";
import { TableSkeleton } from "@/components/common/LoadingSpinner";
import { Pagination } from "@/components/common/Pagination";
import {
  SalesBillFilterBar,
  type SalesBillFilter,
} from "@/components/modules/sales/SalesBillFilterBar";
import { SalesBillsTable } from "@/components/modules/sales/SalesBillsTable";
import { SalesStatCards } from "@/components/modules/sales/SalesStatCards";
import { RecordPaymentDrawer } from "@/components/modules/sales/RecordPaymentDrawer";
import { SubmitBillDialog } from "@/components/modules/sales/SubmitBillDialog";
import { Button } from "@/components/ui/button";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { ROUTES } from "@/constants/routes";
import { getErrorMessage } from "@/lib/errorHandler";
import {
  deleteSalesBill,
  getSalesBills,
  submitSalesBill,
} from "@/services/sales.service";

const PAGE_SIZE = 10;

export default function SalesBillsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<SalesBillFilter>("ALL");
  const [page, setPage] = useState(1);
  const [submitTarget, setSubmitTarget] = useState<SalesBill | null>(null);
  const [paymentBillId, setPaymentBillId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SalesBill | null>(null);

  const filters = {
    status: filter === "ALL" ? undefined : filter,
    page,
    limit: PAGE_SIZE,
  };

  const billsQuery = useQuery({
    queryKey: [...QUERY_KEYS.SALES_BILLS, filters],
    queryFn: () => getSalesBills(filters),
  });

  const submitMutation = useMutation({
    mutationFn: (id: string) => submitSalesBill(id),
    onSuccess: () => {
      toast.success("Bill submitted.");
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SALES_BILLS });
      setSubmitTarget(null);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to submit bill."));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteSalesBill(id),
    onSuccess: () => {
      toast.success("Deleted permanently.");
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SALES_BILLS });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SALES_NOTES });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.STOCK });
      setDeleteTarget(null);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to delete sales bill."));
    },
  });

  const bills = billsQuery.data?.data.data ?? [];
  const total = billsQuery.data?.data.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const summary = billsQuery.data?.data.summary;

  return (
    <div>
      <PageHeader
        title="Sales Bills"
        subtitle="Export invoices generated against buyer POs. Billing is blocked if finished stock is insufficient."
        actionButton={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(ROUTES.SALES.NOTES)}
            >
              <FileText className="size-4" />
              Credit/Debit Notes
            </Button>
            <PageHeaderAction
              label="New Sales Bill"
              icon={<Plus className="size-4" />}
              onClick={() => router.push(ROUTES.SALES.NEW_BILL)}
            />
          </div>
        }
      />

      <SalesStatCards
        totalBilled={summary?.totalBilledThisMonth ?? 0}
        pendingPayment={summary?.pendingPayment ?? 0}
        billsRaised={summary?.billsRaised ?? 0}
      />

      <SalesBillFilterBar
        filter={filter}
        onChange={(value) => {
          setFilter(value);
          setPage(1);
        }}
      />

      {billsQuery.isLoading ? (
        <TableSkeleton rows={6} />
      ) : billsQuery.isError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-sm text-red-700">Failed to load sales bills.</p>
          <Button
            type="button"
            variant="outline"
            className="mt-3"
            onClick={() => void billsQuery.refetch()}
          >
            Retry
          </Button>
        </div>
      ) : (
        <>
          <SalesBillsTable
            bills={bills}
            onAdd={() => router.push(ROUTES.SALES.NEW_BILL)}
            onSubmit={setSubmitTarget}
            onRecordPayment={(bill) => setPaymentBillId(bill.id)}
            onDelete={setDeleteTarget}
          />
          <Pagination
            page={page}
            totalPages={totalPages}
            totalItems={total}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
            label="bills"
          />
        </>
      )}

      <SubmitBillDialog
        open={Boolean(submitTarget)}
        onClose={() => setSubmitTarget(null)}
        onConfirm={() => {
          if (submitTarget) submitMutation.mutate(submitTarget.id);
        }}
      />

      <RecordPaymentDrawer
        open={Boolean(paymentBillId)}
        billId={paymentBillId}
        onClose={() => setPaymentBillId(null)}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => {
          if (!deleteMutation.isPending) setDeleteTarget(null);
        }}
        {...PERMANENT_DELETE}
        description={`${PERMANENT_DELETE.description}${
          deleteTarget ? ` ${deleteTarget.invoiceNumber} will be deleted.` : ""
        }`}
        onConfirm={() => {
          if (!deleteTarget) return;
          deleteMutation.mutate(deleteTarget.id);
        }}
      />
    </div>
  );
}
