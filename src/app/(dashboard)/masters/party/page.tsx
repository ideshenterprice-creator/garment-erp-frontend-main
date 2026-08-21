"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, ShoppingBag, Truck, Wrench } from "lucide-react";
import { toast } from "sonner";
import { mockParties } from "@/mock/masters";
import type { Party } from "@/types";
import { PageHeader, PageHeaderAction } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { FilterBar } from "@/components/common/FilterBar";
import { TableSkeleton } from "@/components/common/LoadingSpinner";
import { Pagination } from "@/components/common/Pagination";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { PartyTable } from "@/components/modules/masters/PartyTable";
import { PartyDrawer } from "@/components/modules/masters/PartyDrawer";

type PartyFilter = "ALL" | "BUYER" | "SUPPLIER" | "KARIGAR";

const PAGE_SIZE = 10;

export default function PartyMasterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [parties, setParties] = useState<Party[]>(mockParties);
  const [filter, setFilter] = useState<PartyFilter>("ALL");
  const [page, setPage] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingParty, setEditingParty] = useState<Party | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Party | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(timer);
  }, []);

  const counts = useMemo(
    () => ({
      buyers: parties.filter((p) => p.type === "BUYER").length,
      suppliers: parties.filter((p) => p.type === "SUPPLIER").length,
      karigars: parties.filter((p) => p.type === "KARIGAR").length,
    }),
    [parties]
  );

  const filtered = useMemo(() => {
    if (filter === "ALL") return parties;
    return parties.filter((party) => party.type === filter);
  }, [parties, filter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function handleSave(party: Party) {
    setParties((prev) => {
      const exists = prev.some((item) => item.id === party.id);
      if (exists) {
        return prev.map((item) => (item.id === party.id ? party : item));
      }
      return [party, ...prev];
    });
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
          value={counts.buyers}
          accent="blue"
          icon={<ShoppingBag className="size-5" />}
        />
        <StatCard
          label="Total Suppliers"
          value={counts.suppliers}
          accent="yellow"
          icon={<Truck className="size-5" />}
        />
        <StatCard
          label="Total Karigars"
          value={counts.karigars}
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
      />

      {loading ? (
        <TableSkeleton />
      ) : (
        <>
          <PartyTable
            parties={pageItems}
            onRowClick={(party) => router.push(`/masters/party/${party.id}`)}
            onEdit={(party) => {
              setEditingParty(party);
              setDrawerOpen(true);
            }}
            onDelete={setDeleteTarget}
            onAdd={() => {
              setEditingParty(null);
              setDrawerOpen(true);
            }}
          />

          <Pagination
            page={page}
            totalPages={totalPages}
            totalItems={filtered.length}
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
        onSave={handleSave}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title={`Delete ${deleteTarget?.name ?? "party"}?`}
        description="This will remove the party from the master list. Existing linked transactions will not be deleted."
        confirmLabel="Delete"
        onConfirm={() => {
          if (!deleteTarget) return;
          setParties((prev) => prev.filter((p) => p.id !== deleteTarget.id));
          toast.success(`${deleteTarget.name} deleted`);
          setPage(1);
        }}
      />
    </div>
  );
}
