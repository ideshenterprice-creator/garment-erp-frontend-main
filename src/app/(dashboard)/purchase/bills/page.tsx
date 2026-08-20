"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Filter, Plus } from "lucide-react";
import { toast } from "sonner";
import { mockPurchaseBills, type MockPurchaseBill } from "@/mock/purchase";
import type { PurchaseBillStatus } from "@/types";
import { PageHeader, PageHeaderAction } from "@/components/common/PageHeader";
import { TableSkeleton } from "@/components/common/LoadingSpinner";
import { Pagination } from "@/components/common/Pagination";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { BillStatCards } from "@/components/modules/purchase/BillStatCards";
import { BillsTable } from "@/components/modules/purchase/BillsTable";
import { ReturnBillDialog } from "@/components/modules/purchase/ReturnBillDialog";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { cn, formatCurrency } from "@/lib/utils";

type BillFilter = "ALL" | PurchaseBillStatus;

const PAGE_SIZE = 7;

const filterTabs: { label: string; value: BillFilter }[] = [
  { label: "All", value: "ALL" },
  { label: "Pending Approval", value: "PENDING" },
  { label: "Confirmed", value: "CONFIRMED" },
  { label: "Returned", value: "RETURNED" },
];

export default function PurchaseBillsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [bills, setBills] = useState(mockPurchaseBills);
  const [filter, setFilter] = useState<BillFilter>("ALL");
  const [page, setPage] = useState(1);
  const [confirmTarget, setConfirmTarget] = useState<MockPurchaseBill | null>(
    null
  );
  const [returnTarget, setReturnTarget] = useState<MockPurchaseBill | null>(
    null
  );

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(timer);
  }, []);

  const filtered = useMemo(() => {
    if (filter === "ALL") return bills;
    return bills.filter((bill) => bill.status === filter);
  }, [bills, filter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div>
      <PageHeader
        title="Purchase Bills"
        subtitle="All fabric and material purchases. Stock updates automatically when a bill is confirmed."
        actionButton={
          <PageHeaderAction
            label="+ New Purchase Bill"
            icon={<Plus className="size-4" />}
            onClick={() => router.push(ROUTES.PURCHASE.NEW)}
          />
        }
      />

      <BillStatCards
        totalBillsThisMonth={12}
        totalFabricPurchasedKg={8400}
        pendingApproval={bills.filter((bill) => bill.status === "PENDING").length}
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-1 rounded-lg bg-slate-100 p-1">
          {filterTabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => {
                setFilter(tab.value);
                setPage(1);
              }}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                filter === tab.value
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <Button type="button" variant="ghost" size="sm" className="text-slate-600">
          <Filter className="size-4" />
          Advanced Filters
        </Button>
      </div>

      {loading ? (
        <TableSkeleton />
      ) : (
        <>
          <BillsTable
            bills={pageItems}
            onView={(bill) => router.push(ROUTES.PURCHASE.DETAIL(bill.id))}
            onConfirm={setConfirmTarget}
            onReturn={setReturnTarget}
            onAdd={() => router.push(ROUTES.PURCHASE.NEW)}
          />
          <Pagination
            page={page}
            totalPages={Math.max(totalPages, 3)}
            totalItems={filter === "ALL" ? 42 : filtered.length}
            pageSize={PAGE_SIZE}
            onPageChange={(next) =>
              setPage(Math.min(next, Math.max(1, totalPages)))
            }
            label="bills"
          />
        </>
      )}

      <ConfirmDialog
        open={Boolean(confirmTarget)}
        onClose={() => setConfirmTarget(null)}
        title="Confirm this purchase bill?"
        description={
          confirmTarget
            ? `${confirmTarget.billNumber} — ${confirmTarget.netWeight.toLocaleString("en-IN")} kg of ${confirmTarget.fabricLabel} (${formatCurrency(confirmTarget.totalAmount)}). Stock will update automatically. This cannot be undone.`
            : "Stock will update automatically."
        }
        confirmLabel="Confirm"
        variant="default"
        onConfirm={() => {
          if (!confirmTarget) return;
          setBills((prev) =>
            prev.map((bill) =>
              bill.id === confirmTarget.id
                ? {
                    ...bill,
                    status: "CONFIRMED",
                    confirmedAt: new Date().toISOString(),
                    stockUpdatedAt: new Date().toISOString(),
                  }
                : bill
            )
          );
          toast.success("Purchase bill confirmed. Stock updated successfully.");
        }}
      />

      <ReturnBillDialog
        open={Boolean(returnTarget)}
        billNumber={returnTarget?.billNumber}
        onClose={() => setReturnTarget(null)}
        onConfirm={() => {
          if (!returnTarget) return;
          setBills((prev) =>
            prev.map((bill) =>
              bill.id === returnTarget.id
                ? { ...bill, status: "RETURNED" }
                : bill
            )
          );
          toast.success("Bill returned successfully");
        }}
      />
    </div>
  );
}
