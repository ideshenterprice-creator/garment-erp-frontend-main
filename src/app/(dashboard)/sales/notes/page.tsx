"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import type { SalesNote, SalesNoteType } from "@/types";
import { PageHeader, PageHeaderAction } from "@/components/common/PageHeader";
import { TableSkeleton } from "@/components/common/LoadingSpinner";
import { Pagination } from "@/components/common/Pagination";
import {
  ConfirmDialog,
  PERMANENT_DELETE,
} from "@/components/common/ConfirmDialog";
import { CreditDebitNotesTable } from "@/components/modules/sales/CreditDebitNotesTable";
import { NewNoteDrawer } from "@/components/modules/sales/NewNoteDrawer";
import { Button } from "@/components/ui/button";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { getErrorMessage } from "@/lib/errorHandler";
import { cn } from "@/lib/utils";
import { deleteNote, getNotes } from "@/services/sales.service";

const PAGE_SIZE = 10;

type NoteFilter = "ALL" | SalesNoteType;

function SalesNotesContent() {
  const searchParams = useSearchParams();
  const billId = searchParams.get("billId") ?? undefined;
  const [filter, setFilter] = useState<NoteFilter>("ALL");
  const [page, setPage] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(Boolean(billId));
  const [deleteTarget, setDeleteTarget] = useState<SalesNote | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (billId) setDrawerOpen(true);
  }, [billId]);

  const filters = {
    type: filter === "ALL" ? undefined : filter,
    page,
    limit: PAGE_SIZE,
  };

  const notesQuery = useQuery({
    queryKey: [...QUERY_KEYS.SALES_NOTES, filters],
    queryFn: () => getNotes(filters),
  });

  const notes = notesQuery.data?.data.data ?? [];
  const total = notesQuery.data?.data.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteNote(id),
    onSuccess: () => {
      toast.success("Deleted permanently.");
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SALES_NOTES });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SALES_BILLS });
      setDeleteTarget(null);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to delete note."));
    },
  });

  return (
    <div>
      <PageHeader
        title="Credit / Debit Notes"
        subtitle="Adjustments against existing sales bills."
        actionButton={
          <PageHeaderAction
            label="New Note"
            icon={<Plus className="size-4" />}
            onClick={() => setDrawerOpen(true)}
          />
        }
      />

      <div className="mb-4 flex flex-wrap gap-1 border-b border-slate-200">
        {(
          [
            { label: "All", value: "ALL" },
            { label: "Credit Notes", value: "CREDIT" },
            { label: "Debit Notes", value: "DEBIT" },
          ] as const
        ).map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => {
              setFilter(tab.value);
              setPage(1);
            }}
            className={cn(
              "relative px-3 py-2 text-sm font-medium",
              filter === tab.value ? "text-slate-900" : "text-slate-500"
            )}
          >
            {tab.label}
            {filter === tab.value ? (
              <span className="absolute inset-x-1 -bottom-px h-0.5 bg-slate-900" />
            ) : null}
          </button>
        ))}
      </div>

      {notesQuery.isLoading ? (
        <TableSkeleton rows={6} />
      ) : notesQuery.isError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-sm text-red-700">Failed to load notes.</p>
          <Button
            type="button"
            variant="outline"
            className="mt-3"
            onClick={() => void notesQuery.refetch()}
          >
            Retry
          </Button>
        </div>
      ) : (
        <>
          <CreditDebitNotesTable
            notes={notes}
            onAdd={() => setDrawerOpen(true)}
            onDelete={setDeleteTarget}
          />
          <Pagination
            page={page}
            totalPages={totalPages}
            totalItems={total}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
            label="notes"
          />
        </>
      )}

      <NewNoteDrawer
        open={drawerOpen}
        initialBillId={billId}
        onClose={() => setDrawerOpen(false)}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => {
          if (!deleteMutation.isPending) setDeleteTarget(null);
        }}
        {...PERMANENT_DELETE}
        description={`${PERMANENT_DELETE.description}${
          deleteTarget ? ` ${deleteTarget.noteNumber} will be deleted.` : ""
        }`}
        onConfirm={() => {
          if (!deleteTarget) return;
          deleteMutation.mutate(deleteTarget.id);
        }}
      />
    </div>
  );
}

export default function SalesNotesPage() {
  return (
    <Suspense fallback={<TableSkeleton rows={6} />}>
      <SalesNotesContent />
    </Suspense>
  );
}
