"use client";

import { useEffect, useMemo, useState } from "react";
import { buildRegisterRows, mockSalesBills } from "@/mock/sales";
import { PageHeader } from "@/components/common/PageHeader";
import { TableSkeleton } from "@/components/common/LoadingSpinner";
import { Pagination } from "@/components/common/Pagination";
import {
  SalesRegisterFilterBar,
  type SalesRegisterFilters,
} from "@/components/modules/sales/SalesRegisterFilterBar";
import { SalesRegisterSummary } from "@/components/modules/sales/SalesRegisterSummary";
import { SalesRegisterTable } from "@/components/modules/sales/SalesRegisterTable";

const PAGE_SIZE = 10;

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
  const [page, setPage] = useState(1);

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

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const pageItems = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div>
      <PageHeader
        title="Sales Register"
        subtitle="Period-wise sales ledger with payment status across all export invoices."
      />

      <SalesRegisterFilterBar
        filters={filters}
        onChange={setFilters}
        onApply={() => {
          setApplied(filters);
          setPage(1);
        }}
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
          <SalesRegisterTable rows={pageItems} totalsFrom={rows} />
          <Pagination
            page={page}
            totalPages={totalPages}
            totalItems={rows.length}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
            label="invoices"
          />
        </>
      )}
    </div>
  );
}
