"use client";

import { useEffect, useMemo, useState } from "react";
import { Info, Plus } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { mockVouchers, type MockVoucher } from "@/mock/accounts";
import { PageHeader, PageHeaderAction } from "@/components/common/PageHeader";
import { TableSkeleton } from "@/components/common/LoadingSpinner";
import { Pagination } from "@/components/common/Pagination";
import {
  VoucherFilterBar,
  type VoucherFilter,
} from "@/components/modules/accounts/VoucherFilterBar";
import { VouchersTable } from "@/components/modules/accounts/VouchersTable";
import { NewVoucherDrawer } from "@/components/modules/accounts/NewVoucherDrawer";
import { formatCurrency } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const PAGE_SIZE = 10;

export default function VouchersPage() {
  const [loading, setLoading] = useState(true);
  const [vouchers, setVouchers] = useState<MockVoucher[]>(mockVouchers);
  const [filter, setFilter] = useState<VoucherFilter>("ALL");
  const [page, setPage] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selected, setSelected] = useState<MockVoucher | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(timer);
  }, []);

  const filtered = useMemo(() => {
    if (filter === "ALL") return vouchers;
    return vouchers.filter((v) => v.type === filter);
  }, [vouchers, filter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

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

      {loading ? (
        <TableSkeleton rows={6} />
      ) : (
        <>
          <VouchersTable
            vouchers={pageItems}
            onAdd={() => setDrawerOpen(true)}
            onRowClick={setSelected}
          />
          <Pagination
            page={page}
            totalPages={totalPages}
            totalItems={filtered.length}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
            label="vouchers"
          />
        </>
      )}

      <NewVoucherDrawer
        open={drawerOpen}
        existing={vouchers}
        onClose={() => setDrawerOpen(false)}
        onSave={(voucher) => {
          setVouchers((prev) => [voucher, ...prev]);
          setPage(1);
          toast.success("Voucher saved successfully.");
        }}
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
                  {formatCurrency(selected.amount)}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Mode</span>
                <span className="font-medium">{selected.paymentMode}</span>
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
    </div>
  );
}
