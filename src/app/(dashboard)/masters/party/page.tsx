"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, ShoppingBag, Truck, Wrench } from "lucide-react";
import { toast } from "sonner";
import type { Party } from "@/types";
import { PageHeader, PageHeaderAction } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { FilterBar } from "@/components/common/FilterBar";
import { TableSkeleton } from "@/components/common/LoadingSpinner";
import { Pagination } from "@/components/common/Pagination";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { PartyTable } from "@/components/modules/masters/PartyTable";
import { PartyDrawer } from "@/components/modules/masters/PartyDrawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { useDebounce } from "@/hooks/useDebounce";
import { getErrorMessage } from "@/lib/errorHandler";
import { getParties, togglePartyStatus } from "@/services/masters.service";

type PartyFilter = "ALL" | "BUYER" | "SUPPLIER" | "KARIGAR";

const PAGE_SIZE = 10;

export default function PartyMasterPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<PartyFilter>("ALL");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingParty, setEditingParty] = useState<Party | null>(null);
  const [statusTarget, setStatusTarget] = useState<Party | null>(null);

  const filters = {
    type: filter === "ALL" ? undefined : filter,
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch || undefined,
  };

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: [...QUERY_KEYS.PARTIES, filters],
    queryFn: () => getParties(filters),
  });

  const buyerCountQuery = useQuery({
    queryKey: [...QUERY_KEYS.PARTIES, { type: "BUYER", limit: 1 }],
    queryFn: () => getParties({ type: "BUYER", limit: 1 }),
  });

  const supplierCountQuery = useQuery({
    queryKey: [...QUERY_KEYS.PARTIES, { type: "SUPPLIER", limit: 1 }],
    queryFn: () => getParties({ type: "SUPPLIER", limit: 1 }),
  });

  const karigarCountQuery = useQuery({
    queryKey: [...QUERY_KEYS.PARTIES, { type: "KARIGAR", limit: 1 }],
    queryFn: () => getParties({ type: "KARIGAR", limit: 1 }),
  });

  const parties = data?.data.data ?? [];
  const total = data?.data.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const filtersActive = filter !== "ALL" || Boolean(debouncedSearch);

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      togglePartyStatus(id, isActive),
    onSuccess: (_, variables) => {
      const action = variables.isActive ? "activated" : "deactivated";
      toast.success(`Party ${action}.`);
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PARTIES });
      setStatusTarget(null);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to update party status."));
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
        title="Party Master"
        subtitle="Manage all buyers, suppliers and Karigars. Every transaction is linked to a party."
        actionButton={
          <PageHeaderAction
            label="Add Party"
            icon={<Plus className="size-4" />}
            onClick={() => {
              setEditingParty(null);
              setDrawerOpen(true);
            }}
          />
        }
      />

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <StatCard
          label="Total Buyers"
          value={buyerCountQuery.data?.data.total ?? 0}
          accent="blue"
          icon={<ShoppingBag className="size-5" />}
        />
        <StatCard
          label="Total Suppliers"
          value={supplierCountQuery.data?.data.total ?? 0}
          accent="yellow"
          icon={<Truck className="size-5" />}
        />
        <StatCard
          label="Total Karigars"
          value={karigarCountQuery.data?.data.total ?? 0}
          accent="purple"
          icon={<Wrench className="size-5" />}
        />
      </div>

      <FilterBar
        tabs={[
          { label: "All", value: "ALL" },
          { label: "Buyers", value: "BUYER" },
          { label: "Suppliers", value: "SUPPLIER" },
          { label: "Karigars", value: "KARIGAR" },
        ]}
        activeTab={filter}
        onTabChange={(value) => {
          setFilter(value as PartyFilter);
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
              placeholder="Search parties..."
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
            Could not load parties
          </p>
          <p className="text-sm text-muted-foreground">
            Check your connection and try again.
          </p>
          <Button type="button" variant="outline" onClick={() => void refetch()}>
            Try Again
          </Button>
        </div>
      ) : (
        <>
          <PartyTable
            parties={parties}
            onRowClick={(party) => router.push(`/masters/party/${party.id}`)}
            onEdit={(party) => {
              setEditingParty(party);
              setDrawerOpen(true);
            }}
            onToggleStatus={setStatusTarget}
            onAdd={() => {
              setEditingParty(null);
              setDrawerOpen(true);
            }}
            emptyTitle={
              filtersActive
                ? "No parties match your filters"
                : "No parties added yet"
            }
            emptyDescription={
              filtersActive
                ? "Try clearing filters or adjusting your search."
                : "Add your first buyer, supplier, or karigar."
            }
            emptyActionLabel="+ Add Party"
            emptyActionIsClear={filtersActive}
            onEmptyAction={
              filtersActive
                ? clearFilters
                : () => {
                    setEditingParty(null);
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

      <PartyDrawer
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setEditingParty(null);
        }}
        party={editingParty}
      />

      <ConfirmDialog
        open={Boolean(statusTarget)}
        onClose={() => {
          if (!toggleStatusMutation.isPending) setStatusTarget(null);
        }}
        title={
          statusTarget?.isActive
            ? `Deactivate ${statusTarget.name}?`
            : `Activate ${statusTarget?.name ?? "party"}?`
        }
        description={
          statusTarget?.isActive
            ? "This party will no longer be available for new transactions."
            : "This party will become available for new transactions."
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
