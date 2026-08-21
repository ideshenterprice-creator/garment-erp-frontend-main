"use client";

import { useEffect, useMemo, useState } from "react";
import { Download } from "lucide-react";
import { toast } from "sonner";
import {
  buildRegisterRows,
  mockSalesBills,
} from "@/mock/sales";
import { PageHeader } from "@/components/common/PageHeader";
import { TableSkeleton } from "@/components/common/LoadingSpinner";
import {
  SalesRegisterFilterBar,
  type SalesRegisterFilters,
} from "@/components/modules/sales/SalesRegisterFilterBar";
import { SalesRegisterSummary } from "@/components/modules/sales/SalesRegisterSummary";
import { SalesRegisterTable } from "@/components/modules/sales/SalesRegisterTable";
import { Button } from "@/components/ui/button";

const defaultFilters: SalesRegisterFilters = {
  fromDate: "",
  toDate: "",
  buyerId: "ALL",
  poId: "ALL",
};

export default function SalesRegisterPage() {
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<SalesRegisterFilters>(defaultFilters);
  const [applied, setApplied] = useState<SalesRegisterFilters>(defaultFilters);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(timer);
  }, []);

  const rows = useMemo(() => {
    const all = buildRegisterRows(mockSalesBills);
    return all.filter((row) => {
      const bill = mockSalesBills.find((item) => item.id === row.id);
      if (!bill) return false;
      if (applied.buyerId !== "ALL" && bill.buyerId !== applied.buyerId) {
        return false;
      }
      if (applied.poId !== "ALL" && bill.poId !== applied.poId) return false;
      if (applied.fromDate && row.invoiceDate < applied.fromDate) return false;
      if (applied.toDate && row.invoiceDate > applied.toDate) return false;
      return true;
    });
  }, [applied]);

  const summary = useMemo(
    () => ({
      totalSales: rows.reduce((sum, row) => sum + row.netAmount, 0),
      totalPieces: rows.reduce((sum, row) => sum + row.totalPieces, 0),
      outstanding: rows.reduce((sum, row) => sum + row.outstanding, 0),
    }),
    [rows]
  );

  return (
    <div>
      <PageHeader
        title="Sales Register"
        subtitle="Period-wise sales ledger with payment status across all export invoices."
      />

      <SalesRegisterFilterBar
        filters={filters}
        onChange={setFilters}
        onApply={() => setApplied(filters)}
      />

      <SalesRegisterSummary
        totalSales={summary.totalSales}
        totalPieces={summary.totalPieces}
        outstanding={summary.outstanding}
      />

      {loading ? (
        <TableSkeleton rows={6} />
      ) : (
        <>
          <SalesRegisterTable rows={rows} />
          <div className="mt-4 flex justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => toast.message("Export feature coming soon")}
            >
              <Download className="size-4" />
              Export to Excel
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
