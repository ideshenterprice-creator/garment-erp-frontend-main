"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Plus } from "lucide-react";
import { toast } from "sonner";
import { mockSalesBills, type MockSalesBill } from "@/mock/sales";
import { PageHeader } from "@/components/common/PageHeader";
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
import { ROUTES } from "@/constants/routes";

const PAGE_SIZE = 6;

export default function SalesBillsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [bills, setBills] = useState<MockSalesBill[]>(mockSalesBills);
  const [filter, setFilter] = useState<SalesBillFilter>("ALL");
  const [page, setPage] = useState(1);
  const [submitTarget, setSubmitTarget] = useState<MockSalesBill | null>(null);
  const [paymentTarget, setPaymentTarget] = useState<MockSalesBill | null>(
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

  const pendingPayment = bills
    .filter((bill) => bill.status === "SUBMITTED" || bill.status === "PAID")
    .reduce(
      (sum, bill) => sum + Math.max(0, bill.netTotal - bill.amountReceived),
      0
    );

  return (
    <div>
      <PageHeader
        title="Sales Bills"
        subtitle="Export invoices generated against buyer POs. Billing is blocked if finished stock is insufficient."
        actionButton={
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(ROUTES.SALES.NOTES)}
            >
              <FileText className="size-4" />
              Credit/Debit Notes
            </Button>
            <Button
              type="button"
              className="bg-[#1b3a3a] text-white hover:bg-[#1b3a3a]/90"
              onClick={() => router.push(ROUTES.SALES.NEW_BILL)}
            >
              <Plus className="size-4" />
              + New Sales Bill
            </Button>
          </div>
        }
      />

      <SalesStatCards
        totalBilled={1842000}
        pendingPayment={pendingPayment || 680000}
        billsRaised={bills.length || 14}
      />

      <SalesBillFilterBar
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
          <SalesBillsTable
            bills={pageItems}
            onAdd={() => router.push(ROUTES.SALES.NEW_BILL)}
            onSubmit={setSubmitTarget}
            onRecordPayment={setPaymentTarget}
          />
          <Pagination
            page={page}
            totalPages={totalPages}
            totalItems={filtered.length}
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
          if (!submitTarget) return;
          setBills((prev) =>
            prev.map((bill) =>
              bill.id === submitTarget.id
                ? { ...bill, status: "SUBMITTED" }
                : bill
            )
          );
          toast.success("Bill submitted successfully.");
        }}
      />

      <RecordPaymentDrawer
        open={Boolean(paymentTarget)}
        bill={paymentTarget}
        onClose={() => setPaymentTarget(null)}
        onSave={(values) => {
          if (!paymentTarget) return;
          setBills((prev) =>
            prev.map((bill) => {
              if (bill.id !== paymentTarget.id) return bill;
              const amountReceived = bill.amountReceived + values.amountReceived;
              return {
                ...bill,
                amountReceived,
                status:
                  amountReceived >= bill.netTotal ? "PAID" : bill.status,
                payments: [
                  ...bill.payments,
                  {
                    id: `pay-${Date.now()}`,
                    salesBillId: bill.id,
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
    </div>
  );
}
