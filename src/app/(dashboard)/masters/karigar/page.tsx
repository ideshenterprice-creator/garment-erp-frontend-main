"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Layers, Plus, UserX, Users } from "lucide-react";
import { toast } from "sonner";
import { mockKarigars } from "@/mock/masters";
import type { KarigarProfile } from "@/types";
import { PageHeader, PageHeaderAction } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { FilterBar } from "@/components/common/FilterBar";
import { TableSkeleton } from "@/components/common/LoadingSpinner";
import { Pagination } from "@/components/common/Pagination";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { KarigarTable } from "@/components/modules/masters/KarigarTable";
import { KarigarDrawer } from "@/components/modules/masters/KarigarDrawer";

type KarigarFilter = "ALL" | "PIECE_RATE" | "WEEKLY_SALARY" | "BOTH";

const PAGE_SIZE = 10;

export default function KarigarMasterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [karigars, setKarigars] = useState<KarigarProfile[]>(mockKarigars);
  const [filter, setFilter] = useState<KarigarFilter>("ALL");
  const [page, setPage] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<KarigarProfile | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<KarigarProfile | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(timer);
  }, []);

  const filtered = useMemo(() => {
    if (filter === "ALL") return karigars;
    return karigars.filter((item) => item.paymentType === filter);
  }, [karigars, filter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const stats = useMemo(
    () => ({
      total: karigars.length,
      inactive: karigars.filter((item) => !item.isActive).length,
      withOps: karigars.filter((item) => item.operations.length > 0).length,
    }),
    [karigars]
  );

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

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <StatCard
          label="Total Karigars"
          value={stats.total}
          accent="purple"
          icon={<Users className="size-5" />}
        />
        <StatCard
          label="Inactive"
          value={stats.inactive}
          accent="red"
          icon={<UserX className="size-5" />}
        />
        <StatCard
          label="With Operations"
          value={stats.withOps}
          accent="blue"
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

      {loading ? (
        <TableSkeleton />
      ) : (
        <>
          <KarigarTable
            karigars={pageItems}
            onRowClick={(karigar) =>
              router.push(`/masters/karigar/${karigar.id}`)
            }
            onEdit={(karigar) => {
              setEditing(karigar);
              setDrawerOpen(true);
            }}
            onDelete={setDeleteTarget}
            onAdd={() => {
              setEditing(null);
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

      <KarigarDrawer
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setEditing(null);
        }}
        karigar={editing}
        onSave={(karigar) => {
          setKarigars((prev) => {
            const exists = prev.some((item) => item.id === karigar.id);
            if (exists) {
              return prev.map((item) =>
                item.id === karigar.id ? karigar : item
              );
            }
            return [karigar, ...prev];
          });
        }}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title={`Delete ${deleteTarget?.party.name ?? "karigar"}?`}
        description="This karigar profile will be removed from the master list."
        confirmLabel="Delete"
        onConfirm={() => {
          if (!deleteTarget) return;
          setKarigars((prev) =>
            prev.filter((item) => item.id !== deleteTarget.id)
          );
          toast.success(`${deleteTarget.party.name} deleted`);
          setPage(1);
        }}
      />
    </div>
  );
}
