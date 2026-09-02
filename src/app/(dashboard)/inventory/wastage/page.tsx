"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import type { CuttingWastage } from "@/types";
import { PageHeader, PageHeaderAction } from "@/components/common/PageHeader";
import { TableSkeleton } from "@/components/common/LoadingSpinner";
import { Pagination } from "@/components/common/Pagination";
import {
  ConfirmDialog,
  PERMANENT_DELETE,
} from "@/components/common/ConfirmDialog";
import { RecordWastageDrawer } from "@/components/modules/inventory/RecordWastageDrawer";
import { WastageStatCards } from "@/components/modules/inventory/WastageStatCards";
import { WastageTable } from "@/components/modules/inventory/WastageTable";
import { Button } from "@/components/ui/button";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { getErrorMessage } from "@/lib/errorHandler";
import {
  deleteWastage,
  getWastage,
  markWastageSold,
} from "@/services/inventory.service";

const PAGE_SIZE = 10;

export default function CuttingWastagePage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<CuttingWastage | null>(null);

  const filters = { page, limit: PAGE_SIZE };

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: [...QUERY_KEYS.WASTAGE, filters],
    queryFn: () => getWastage(filters),
  });

  const entries = data?.data.data ?? [];
  const total = data?.data.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const summary = data?.data.summary;

  const markSoldMutation = useMutation({
    mutationFn: (id: string) => markWastageSold(id),
    onSuccess: () => {
      toast.success("Wastage marked as sold.");
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.WASTAGE });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.STOCK });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to mark wastage as sold."));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteWastage(id),
    onSuccess: () => {
      toast.success("Deleted permanently.");
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.WASTAGE });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.STOCK });
      setDeleteTarget(null);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to delete wastage."));
    },
  });

  return (
    <div>
      <PageHeader
        title="Cutting Wastage"
        subtitle="Fabric leftover from cutting. Tracked separately because wastage is sold and its value must be recorded."
        actionButton={
          <PageHeaderAction
            label="Record Wastage Return"
            icon={<Plus className="size-4" />}
            onClick={() => setDrawerOpen(true)}
          />
        }
      />

      <WastageStatCards
        totalInStockKg={summary?.totalWastageInStock ?? 0}
        totalSoldKg={summary?.totalWastageSold ?? 0}
        totalValue={summary?.totalWastageValue ?? 0}
      />

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-4 py-3">
          <h2 className="text-base font-semibold text-slate-900">Wastage Logs</h2>
        </div>

        <div className="p-0">
          {isLoading ? (
            <div className="p-4">
              <TableSkeleton rows={6} />
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center gap-3 px-6 py-12 text-center">
              <p className="text-sm font-medium text-slate-900">
                Could not load wastage records
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={() => void refetch()}
              >
                Try Again
              </Button>
            </div>
          ) : (
            <WastageTable
              entries={entries}
              onAdd={() => setDrawerOpen(true)}
              onMarkSold={(entry) => markSoldMutation.mutate(entry.id)}
              onDelete={setDeleteTarget}
              markingSoldId={
                markSoldMutation.isPending
                  ? markSoldMutation.variables ?? null
                  : null
              }
            />
          )}
        </div>

        {!isLoading && !isError ? (
          <div className="border-t border-slate-100 px-4 pb-4">
            <Pagination
              page={page}
              totalPages={totalPages}
              totalItems={total}
              pageSize={PAGE_SIZE}
              onPageChange={setPage}
              label="entries"
            />
          </div>
        ) : null}
      </div>

      <RecordWastageDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => {
          if (!deleteMutation.isPending) setDeleteTarget(null);
        }}
        {...PERMANENT_DELETE}
        description={`${PERMANENT_DELETE.description}${
          deleteTarget ? ` ${deleteTarget.wastageNumber} will be deleted.` : ""
        }`}
        onConfirm={() => {
          if (!deleteTarget) return;
          deleteMutation.mutate(deleteTarget.id);
        }}
      />
    </div>
  );
}
