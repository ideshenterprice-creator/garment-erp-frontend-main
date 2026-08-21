"use client";

import { useEffect, useMemo, useState } from "react";
import { Info, Plus } from "lucide-react";
import { toast } from "sonner";
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

const PAGE_SIZE = 6;

export default function VouchersPage() {
  const [loading, setLoading] = useState(true);
  const [vouchers, setVouchers] = useState<MockVoucher[]>(mockVouchers);
  const [filter, setFilter] = useState<VoucherFilter>("ALL");
  const [page, setPage] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);

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
            label="+ New Voucher"
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
        onExport={() => toast.message("Export coming soon.")}
      />

      {loading ? (
        <TableSkeleton rows={6} />
      ) : (
        <>
          <VouchersTable
            vouchers={pageItems}
            onAdd={() => setDrawerOpen(true)}
            onView={(v) => toast.message(`Viewing ${v.voucherNumber}`)}
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
        }}
      />
    </div>
  );
}
