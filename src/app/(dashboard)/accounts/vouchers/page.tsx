"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Info, Plus } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { toast } from "sonner";
import type { CreateVoucherPayload, Voucher } from "@/types";
import { PageHeader, PageHeaderAction } from "@/components/common/PageHeader";
import { TableSkeleton } from "@/components/common/LoadingSpinner";
import { Pagination } from "@/components/common/Pagination";
import {
  ConfirmDialog,
  PERMANENT_DELETE,
} from "@/components/common/ConfirmDialog";
import {
  VoucherFilterBar,
  type VoucherFilter,
} from "@/components/modules/accounts/VoucherFilterBar";
import { VouchersTable } from "@/components/modules/accounts/VouchersTable";
import { NewVoucherDrawer } from "@/components/modules/accounts/NewVoucherDrawer";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { ACCOUNT_PAYMENT_MODES, toIsoDate } from "@/lib/accounts";
import { getErrorMessage } from "@/lib/errorHandler";
import { formatCurrency } from "@/lib/utils";
import { createVoucher, deleteVoucher, getVouchers } from "@/services/accounts.service";

const PAGE_SIZE = 10;

function modeLabel(mode: string): string {
  return (
    ACCOUNT_PAYMENT_MODES.find((item) => item.value === mode)?.label ?? mode
  );
}

export default function VouchersPage() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<VoucherFilter>("ALL");
  const [page, setPage] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selected, setSelected] = useState<Voucher | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Voucher | null>(null);

  const queryFilters = {
    type: filter === "ALL" ? undefined : filter,
    page,
    limit: PAGE_SIZE,
  };

  const vouchersQuery = useQuery({
    queryKey: [...QUERY_KEYS.VOUCHERS, queryFilters],
    queryFn: () => getVouchers(queryFilters),
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreateVoucherPayload) =>
      createVoucher({
        ...payload,
        date: toIsoDate(payload.date),
      }),
    onSuccess: () => {
      toast.success("Voucher saved.");
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.VOUCHERS });
      setDrawerOpen(false);
      setPage(1);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to save voucher."));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteVoucher(id),
    onSuccess: () => {
      toast.success("Deleted permanently.");
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.VOUCHERS });
      setDeleteTarget(null);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to delete voucher."));
    },
  });

  const vouchers = vouchersQuery.data?.data.data ?? [];
  const total = vouchersQuery.data?.data.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div>
      <PageHeader
        title="Vouchers"
        subtitle="Record cash and bank transactions not linked to any purchase or sales bill."
        actionButton={
          <PageHeaderAction
            label="New Voucher"
            icon={<Plus className="size-4" />}
            onClick={() => setDrawerOpen(true)}
          />
        }
      />

      <div className="mb-6 flex items-start gap-3 rounded-xl border border-sky-100 border-l-4 border-l-sky-500 bg-sky-50/70 px-4 py-3">
        <Info className="mt-0.5 size-4 shrink-0 text-sky-600" />
        <p className="text-sm text-slate-700">
          Note: Purchase and sales bills are recorded automatically. Use vouchers
          only for other transactions like expenses, advances, or bank
          transfers.
        </p>
      </div>

      <VoucherFilterBar
        filter={filter}
        onChange={(value) => {
          setFilter(value);
          setPage(1);
        }}
      />

      {vouchersQuery.isLoading ? (
        <TableSkeleton rows={6} />
      ) : vouchersQuery.isError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-sm text-red-700">Failed to load vouchers.</p>
          <Button
            type="button"
            variant="outline"
            className="mt-3"
            onClick={() => void vouchersQuery.refetch()}
          >
            Retry
          </Button>
        </div>
      ) : (
        <>
          <VouchersTable
            vouchers={vouchers}
            onAdd={() => setDrawerOpen(true)}
            onView={setSelected}
            onDelete={setDeleteTarget}
          />
          <Pagination
            page={page}
            totalPages={totalPages}
            totalItems={total}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
            label="vouchers"
          />
        </>
      )}

      <NewVoucherDrawer
        open={drawerOpen}
        isSubmitting={createMutation.isPending}
        onClose={() => setDrawerOpen(false)}
        onSave={(payload) => createMutation.mutate(payload)}
      />

      <Dialog
        open={Boolean(selected)}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selected?.voucherNumber}</DialogTitle>
          </DialogHeader>
          {selected ? (
            <div className="grid gap-3 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Date</span>
                <span className="font-medium">
                  {format(new Date(selected.date), "dd MMM yyyy")}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Type</span>
                <span className="font-medium capitalize">
                  {selected.type.toLowerCase()}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Party / Description</span>
                <span className="max-w-[60%] text-right font-medium">
                  {selected.partyDescription}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-semibold">
                  {formatCurrency(Number(selected.amount))}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Mode</span>
                <span className="font-medium">
                  {modeLabel(selected.paymentMode)}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Reference</span>
                <span className="font-medium">
                  {selected.referenceNo || "—"}
                </span>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => {
          if (!deleteMutation.isPending) setDeleteTarget(null);
        }}
        {...PERMANENT_DELETE}
        description={`${PERMANENT_DELETE.description}${
          deleteTarget ? ` ${deleteTarget.voucherNumber} will be deleted.` : ""
        }`}
        onConfirm={() => {
          if (!deleteTarget) return;
          deleteMutation.mutate(deleteTarget.id);
        }}
      />
    </div>
  );
}
