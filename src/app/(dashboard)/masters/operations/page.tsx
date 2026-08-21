"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Plus } from "lucide-react";
import { toast } from "sonner";
import { mockOperations, type MockOperation } from "@/mock/masters";
import { PageHeader, PageHeaderAction } from "@/components/common/PageHeader";
import { TableSkeleton } from "@/components/common/LoadingSpinner";
import { Pagination } from "@/components/common/Pagination";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { OperationsTable } from "@/components/modules/masters/OperationsTable";
import { OperationsDrawer } from "@/components/modules/masters/OperationsDrawer";

const PAGE_SIZE = 10;

export default function OperationsMasterPage() {
  const [loading, setLoading] = useState(true);
  const [operations, setOperations] = useState<MockOperation[]>(mockOperations);
  const [page, setPage] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<MockOperation | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MockOperation | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(timer);
  }, []);

  const totalPages = Math.max(1, Math.ceil(operations.length / PAGE_SIZE));
  const pageItems = operations.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

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

      {loading ? (
        <TableSkeleton />
      ) : (
        <>
          <OperationsTable
            operations={pageItems}
            onEdit={(operation) => {
              setEditing(operation);
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
            totalItems={operations.length}
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
        onSave={(operation) => {
          setOperations((prev) => {
            const exists = prev.some((item) => item.id === operation.id);
            if (exists) {
              return prev.map((item) =>
                item.id === operation.id ? operation : item
              );
            }
            return [operation, ...prev];
          });
        }}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title={`Delete ${deleteTarget?.name ?? "operation"}?`}
        description="This operation and its locked rate will be removed from the rate matrix."
        confirmLabel="Delete"
        onConfirm={() => {
          if (!deleteTarget) return;
          setOperations((prev) =>
            prev.filter((item) => item.id !== deleteTarget.id)
          );
          toast.success(`${deleteTarget.name} deleted`);
          setPage(1);
        }}
      />
    </div>
  );
}
