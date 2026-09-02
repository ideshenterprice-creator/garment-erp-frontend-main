"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format, startOfMonth } from "date-fns";
import { toast } from "sonner";
import type { IssueRecord } from "@/types";
import { PageHeader } from "@/components/common/PageHeader";
import { TableSkeleton } from "@/components/common/LoadingSpinner";
import { Pagination } from "@/components/common/Pagination";
import {
  ConfirmDialog,
  PERMANENT_DELETE,
} from "@/components/common/ConfirmDialog";
import {
  IssueHistoryFilterBar,
  type IssueHistoryFilters,
} from "@/components/modules/inventory/IssueHistoryFilterBar";
import { IssueHistoryTable } from "@/components/modules/inventory/IssueHistoryTable";
import { Button } from "@/components/ui/button";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { getErrorMessage } from "@/lib/errorHandler";
import { deleteIssue, getIssues } from "@/services/inventory.service";
import { getParties } from "@/services/masters.service";
import { getPurchaseOrders } from "@/services/purchaseOrders.service";

const PAGE_SIZE = 10;

function defaultFilters(): IssueHistoryFilters {
  const today = new Date();
  return {
    from: format(startOfMonth(today), "yyyy-MM-dd"),
    to: format(today, "yyyy-MM-dd"),
    issueType: "ALL",
    karigarId: "ALL",
    poId: "ALL",
    status: "ALL",
  };
}

export default function IssueHistoryPage() {
  const initial = useMemo(() => defaultFilters(), []);
  const [draftFilters, setDraftFilters] = useState<IssueHistoryFilters>(initial);
  const [appliedFilters, setAppliedFilters] =
    useState<IssueHistoryFilters>(initial);
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<IssueRecord | null>(null);
  const queryClient = useQueryClient();

  const karigarsQuery = useQuery({
    queryKey: [...QUERY_KEYS.PARTIES, { type: "KARIGAR", limit: 100 }],
    queryFn: () => getParties({ type: "KARIGAR", limit: 100 }),
  });

  const posQuery = useQuery({
    queryKey: [...QUERY_KEYS.PURCHASE_ORDERS, { limit: 100 }],
    queryFn: () => getPurchaseOrders({ limit: 100 }),
  });

  const queryFilters = {
    issueType:
      appliedFilters.issueType === "ALL"
        ? undefined
        : appliedFilters.issueType,
    karigarId:
      appliedFilters.karigarId === "ALL"
        ? undefined
        : appliedFilters.karigarId,
    poId: appliedFilters.poId === "ALL" ? undefined : appliedFilters.poId,
    status:
      appliedFilters.status === "ALL" ? undefined : appliedFilters.status,
    from: appliedFilters.from || undefined,
    to: appliedFilters.to || undefined,
    page,
    limit: PAGE_SIZE,
  };

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: [...QUERY_KEYS.ISSUES, queryFilters],
    queryFn: () => getIssues(queryFilters),
  });

  const issues = data?.data.data ?? [];
  const total = data?.data.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteIssue(id),
    onSuccess: () => {
      toast.success("Deleted permanently.");
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ISSUES });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.STOCK });
      setDeleteTarget(null);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to delete issue."));
    },
  });

  return (
    <div>
      <PageHeader
        title="Issue History"
        subtitle="All material issued to Karigars and production stages."
      />

      <IssueHistoryFilterBar
        filters={draftFilters}
        onChange={setDraftFilters}
        onApply={() => {
          setAppliedFilters(draftFilters);
          setPage(1);
        }}
        karigars={karigarsQuery.data?.data.data ?? []}
        purchaseOrders={posQuery.data?.data.data ?? []}
        karigarsLoading={karigarsQuery.isLoading}
        posLoading={posQuery.isLoading}
      />

      {isLoading ? (
        <TableSkeleton rows={8} />
      ) : isError ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-6 py-12 text-center">
          <p className="text-sm font-medium text-slate-900">
            Could not load issue history
          </p>
          <Button type="button" variant="outline" onClick={() => void refetch()}>
            Try Again
          </Button>
        </div>
      ) : (
        <>
          <IssueHistoryTable issues={issues} onDelete={setDeleteTarget} />
          <Pagination
            page={page}
            totalPages={totalPages}
            totalItems={total}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
            label="issues"
          />
        </>
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => {
          if (!deleteMutation.isPending) setDeleteTarget(null);
        }}
        {...PERMANENT_DELETE}
        description={`${PERMANENT_DELETE.description}${
          deleteTarget ? ` ${deleteTarget.issueNumber} will be deleted.` : ""
        }`}
        onConfirm={() => {
          if (!deleteTarget) return;
          deleteMutation.mutate(deleteTarget.id);
        }}
      />
    </div>
  );
}
