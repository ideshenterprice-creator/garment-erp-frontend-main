"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Plus, Search } from "lucide-react";
import { toast } from "sonner";
import type { Operation, OperationStage } from "@/types";
import { PageHeader, PageHeaderAction } from "@/components/common/PageHeader";
import { FilterBar } from "@/components/common/FilterBar";
import { TableSkeleton } from "@/components/common/LoadingSpinner";
import { Pagination } from "@/components/common/Pagination";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { OperationsTable } from "@/components/modules/masters/OperationsTable";
import { OperationsDrawer } from "@/components/modules/masters/OperationsDrawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { useDebounce } from "@/hooks/useDebounce";
import { getErrorMessage } from "@/lib/errorHandler";
import {
  getOperations,
  toggleOperationStatus,
} from "@/services/masters.service";

type StageFilter = "ALL" | OperationStage;

const PAGE_SIZE = 10;

export default function OperationsMasterPage() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<StageFilter>("ALL");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Operation | null>(null);
  const [statusTarget, setStatusTarget] = useState<Operation | null>(null);

  const filters = {
    stage: filter === "ALL" ? undefined : filter,
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch || undefined,
  };

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: [...QUERY_KEYS.OPERATIONS, filters],
    queryFn: () => getOperations(filters),
  });

  const operations = data?.data.data ?? [];
  const total = data?.data.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const filtersActive = filter !== "ALL" || Boolean(debouncedSearch);

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      toggleOperationStatus(id, isActive),
    onSuccess: (_, variables) => {
      toast.success(
        variables.isActive ? "Operation activated." : "Operation deactivated."
      );
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.OPERATIONS });
      setStatusTarget(null);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to update operation status."));
    },
  });

  function clearFilters() {
    setFilter("ALL");
    setSearch("");
    setPage(1);
  }

  return (
    <div>
      <PageHeader
        title="Operations & Rates"
        subtitle="Every production operation has a fixed rate per piece."
        actionButton={
          <PageHeaderAction
            label="Add Operation"
            icon={<Plus className="size-4" />}
            onClick={() => {
              setEditing(null);
              setDrawerOpen(true);
            }}
          />
        }
      />

      <div className="mb-6 rounded-lg border border-amber-200 bg-[#fbf3e8] px-4 py-3 text-sm text-amber-950">
        <div className="flex gap-2">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600" />
          <p>
            <span className="font-semibold">Notice:</span> Rates defined here are
            final. Karigar payments are auto-calculated based on these entries.{" "}
            <span className="font-semibold underline">
              No manual override allowed
            </span>{" "}
            at the billing stage.
          </p>
        </div>
      </div>

      <FilterBar
        tabs={[
          { label: "All", value: "ALL" },
          { label: "Cutting", value: "CUTTING" },
          { label: "Printing", value: "PRINTING" },
          { label: "Coloring", value: "COLORING" },
          { label: "Stitching", value: "STITCHING" },
          { label: "Finishing", value: "FINISHING" },
        ]}
        activeTab={filter}
        onTabChange={(value) => {
          setFilter(value as StageFilter);
          setPage(1);
        }}
        extraActions={
          <div className="relative w-full sm:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search operations..."
              className="pl-9"
            />
          </div>
        }
      />

      {isLoading ? (
        <TableSkeleton rows={5} />
      ) : isError ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-6 py-12 text-center">
          <p className="text-sm font-medium text-slate-900">
            Could not load operations
          </p>
          <Button type="button" variant="outline" onClick={() => void refetch()}>
            Try Again
          </Button>
        </div>
      ) : (
        <>
          <OperationsTable
            operations={operations}
            onEdit={(operation) => {
              setEditing(operation);
              setDrawerOpen(true);
            }}
            onToggleStatus={setStatusTarget}
            onAdd={() => {
              setEditing(null);
              setDrawerOpen(true);
            }}
            emptyTitle={
              filtersActive
                ? "No operations match your filters"
                : "No operations added yet"
            }
            emptyDescription={
              filtersActive
                ? "Try clearing filters or adjusting your search."
                : "Add production operations and piece rates."
            }
            emptyActionLabel="+ Add Operation"
            emptyActionIsClear={filtersActive}
            onEmptyAction={
              filtersActive
                ? clearFilters
                : () => {
                    setEditing(null);
                    setDrawerOpen(true);
                  }
            }
          />
          <Pagination
            page={page}
            totalPages={totalPages}
            totalItems={total}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
            label="operations"
          />
        </>
      )}

      <OperationsDrawer
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setEditing(null);
        }}
        operation={editing}
      />

      <ConfirmDialog
        open={Boolean(statusTarget)}
        onClose={() => {
          if (!toggleStatusMutation.isPending) setStatusTarget(null);
        }}
        title={
          statusTarget?.isActive
            ? `Deactivate ${statusTarget.name}?`
            : `Activate ${statusTarget?.name ?? "operation"}?`
        }
        description={
          statusTarget?.isActive
            ? "This operation will no longer be assignable to karigars."
            : "This operation will become available again."
        }
        confirmLabel={statusTarget?.isActive ? "Deactivate" : "Activate"}
        onConfirm={() => {
          if (!statusTarget) return;
          toggleStatusMutation.mutate({
            id: statusTarget.id,
            isActive: !statusTarget.isActive,
          });
        }}
      />
    </div>
  );
}
