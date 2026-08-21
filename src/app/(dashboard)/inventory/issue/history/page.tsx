"use client";

import { useEffect, useMemo, useState } from "react";
import { mockIssueRecords, type MockIssueRecord } from "@/mock/inventory";
import { PageHeader } from "@/components/common/PageHeader";
import { TableSkeleton } from "@/components/common/LoadingSpinner";
import { Pagination } from "@/components/common/Pagination";
import {
  IssueHistoryFilterBar,
  type IssueHistoryFilters,
} from "@/components/modules/inventory/IssueHistoryFilterBar";
import { IssueHistoryTable } from "@/components/modules/inventory/IssueHistoryTable";

const PAGE_SIZE = 10;

const defaultFilters: IssueHistoryFilters = {
  dateRange: "THIS_MONTH",
  issueType: "ALL",
  karigarId: "ALL",
  poId: "ALL",
};

export default function IssueHistoryPage() {
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<IssueHistoryFilters>(defaultFilters);
  const [applied, setApplied] = useState<IssueHistoryFilters>(defaultFilters);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(timer);
  }, []);

  const filtered = useMemo(() => {
    return mockIssueRecords.filter((issue: MockIssueRecord) => {
      if (applied.issueType !== "ALL" && issue.issueType !== applied.issueType) {
        return false;
      }
      if (applied.karigarId !== "ALL" && issue.karigarId !== applied.karigarId) {
        return false;
      }
      if (applied.poId !== "ALL" && issue.poId !== applied.poId) {
        return false;
      }
      return true;
    });
  }, [applied]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div>
      <PageHeader
        title="Issue History"
        subtitle="All material issued to Karigars and production stages."
      />

      <IssueHistoryFilterBar
        filters={filters}
        onChange={setFilters}
        onApply={() => {
          setApplied(filters);
          setPage(1);
        }}
      />

      {loading ? (
        <TableSkeleton rows={8} />
      ) : (
        <>
          <IssueHistoryTable issues={pageItems} />
          <Pagination
            page={page}
            totalPages={totalPages}
            totalItems={filtered.length}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
            label="issues"
          />
        </>
      )}
    </div>
  );
}
