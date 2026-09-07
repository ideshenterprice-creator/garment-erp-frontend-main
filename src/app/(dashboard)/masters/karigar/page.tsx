"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Layers, Plus, Users, Wallet } from "lucide-react";
import { toast } from "sonner";
import type { KarigarProfile } from "@/types";
import { PageHeader, PageHeaderAction } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { FilterBar } from "@/components/common/FilterBar";
import { TableSkeleton } from "@/components/common/LoadingSpinner";
import { Pagination } from "@/components/common/Pagination";
import {
  ConfirmDialog,
  PERMANENT_DELETE,
} from "@/components/common/ConfirmDialog";
import { KarigarTable } from "@/components/modules/masters/KarigarTable";
import { KarigarDrawer } from "@/components/modules/masters/KarigarDrawer";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { getErrorMessage } from "@/lib/errorHandler";
import {
  getKarigars,
  getKarigarStats,
  toggleKarigarStatus,
  deleteKarigar,
} from "@/services/masters.service";

type KarigarFilter = "ALL" | "PIECE_RATE" | "WEEKLY_SALARY" | "BOTH";

const PAGE_SIZE = 10;

export default function KarigarMasterPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<KarigarFilter>("ALL");
  const [page, setPage] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<KarigarProfile | null>(null);
  const [statusTarget, setStatusTarget] = useState<KarigarProfile | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<KarigarProfile | null>(null);

  const filters = {
    paymentType: filter === "ALL" ? undefined : filter,
    page,
    limit: PAGE_SIZE,
  };

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: [...QUERY_KEYS.KARIGARS, filters],
    queryFn: () => getKarigars(filters),
  });

  const statsQuery = useQuery({
    queryKey: [...QUERY_KEYS.KARIGARS, "stats"],
    queryFn: () => getKarigarStats(),
  });

  const stats = statsQuery.data?.data;

  const karigars = data?.data.data ?? [];
  const total = data?.data.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const filtersActive = filter !== "ALL";

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      toggleKarigarStatus(id, isActive),
    onSuccess: (_, variables) => {
      toast.success(
        variables.isActive ? "Karigar activated." : "Karigar deactivated."
      );
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.KARIGARS });
      setStatusTarget(null);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to update karigar status."));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteKarigar(id),
    onSuccess: () => {
      toast.success("Karigar deleted permanently.");
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.KARIGARS });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PARTIES });
      setDeleteTarget(null);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to delete karigar."));
    },
  });

  function clearFilters() {
    setFilter("ALL");
    setPage(1);
  }

  return (
    <div>
      <PageHeader
        title="Karigar Master"
        subtitle="Manage karigar profiles, payment types, and assigned operations."
        actionButton={
          <PageHeaderAction
            label="Add Karigar"
            icon={<Plus className="size-4" />}
            onClick={() => {
              setEditing(null);
              setDrawerOpen(true);
            }}
          />
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Karigars"
          value={stats?.totalKarigars ?? 0}
          accent="purple"
          icon={<Users className="size-5" />}
        />
        <StatCard
          label="Piece Rate"
          value={stats?.pieceRateCount ?? 0}
          accent="blue"
          icon={<Layers className="size-5" />}
        />
        <StatCard
          label="Weekly Salary"
          value={stats?.weeklySalaryCount ?? 0}
          accent="yellow"
          icon={<Wallet className="size-5" />}
        />
        <StatCard
          label="Pending Payment"
          value={formatCurrency(stats?.pendingPaymentAmount ?? 0)}
          accent="teal"
          icon={<Layers className="size-5" />}
        />
      </div>

      <FilterBar
        tabs={[
          { label: "All", value: "ALL" },
          { label: "Piece Rate", value: "PIECE_RATE" },
          { label: "Weekly Salary", value: "WEEKLY_SALARY" },
          { label: "Both", value: "BOTH" },
        ]}
        activeTab={filter}
        onTabChange={(value) => {
          setFilter(value as KarigarFilter);
          setPage(1);
        }}
      />

      {isLoading ? (
        <TableSkeleton rows={5} />
      ) : isError ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-6 py-12 text-center">
          <p className="text-sm font-medium text-slate-900">
            Could not load karigars
          </p>
          <Button type="button" variant="outline" onClick={() => void refetch()}>
            Try Again
          </Button>
        </div>
      ) : (
        <>
          <KarigarTable
            karigars={karigars}
            onRowClick={(karigar) =>
              router.push(`/masters/karigar/${karigar.id}`)
            }
            onEdit={(karigar) => {
              setEditing(karigar);
              setDrawerOpen(true);
            }}
            onToggleStatus={setStatusTarget}
            onDelete={setDeleteTarget}
            onAdd={() => {
              setEditing(null);
              setDrawerOpen(true);
            }}
            emptyTitle={
              filtersActive
                ? "No karigars match your filters"
                : "No karigar profiles found"
            }
            emptyDescription={
              filtersActive
                ? "Try clearing filters."
                : "Create karigar profiles linked to party master."
            }
            emptyActionLabel="+ Add Karigar"
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
            label="entries"
          />
        </>
      )}

      <KarigarDrawer
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setEditing(null);
        }}
        karigar={editing}
      />

      <ConfirmDialog
        open={Boolean(statusTarget)}
        onClose={() => {
          if (!toggleStatusMutation.isPending) setStatusTarget(null);
        }}
        title={
          statusTarget?.isActive
            ? `Deactivate ${statusTarget.party.name}?`
            : `Activate ${statusTarget?.party.name ?? "karigar"}?`
        }
        description={
          statusTarget?.isActive
            ? "This karigar will no longer be available for production assignment."
            : "This karigar will become available for production assignment."
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

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => {
          if (!deleteMutation.isPending) setDeleteTarget(null);
        }}
        {...PERMANENT_DELETE}
        description={`${PERMANENT_DELETE.description}${
          deleteTarget ? ` ${deleteTarget.party.name} will be deleted.` : ""
        }`}
        onConfirm={() => {
          if (!deleteTarget) return;
          deleteMutation.mutate(deleteTarget.id);
        }}
      />
    </div>
  );
}
