"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";
import {
  mockCreditDebitNotes,
  type MockCreditDebitNote,
  type NoteType,
} from "@/mock/sales";
import { PageHeader, PageHeaderAction } from "@/components/common/PageHeader";
import { TableSkeleton } from "@/components/common/LoadingSpinner";
import { Pagination } from "@/components/common/Pagination";
import { CreditDebitNotesTable } from "@/components/modules/sales/CreditDebitNotesTable";
import { NewNoteDrawer } from "@/components/modules/sales/NewNoteDrawer";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 8;

type NoteFilter = "ALL" | NoteType;

function SalesNotesContent() {
  const searchParams = useSearchParams();
  const billId = searchParams.get("billId") ?? undefined;
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] =
    useState<MockCreditDebitNote[]>(mockCreditDebitNotes);
  const [filter, setFilter] = useState<NoteFilter>("ALL");
  const [page, setPage] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(Boolean(billId));

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (billId) setDrawerOpen(true);
  }, [billId]);

  const filtered = useMemo(() => {
    if (filter === "ALL") return notes;
    return notes.filter((note) => note.type === filter);
  }, [notes, filter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div>
      <PageHeader
        title="Credit / Debit Notes"
        subtitle="Adjustments against existing sales bills."
        actionButton={
          <PageHeaderAction
            label="+ New Note"
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

      {loading ? (
        <TableSkeleton rows={6} />
      ) : (
        <>
          <CreditDebitNotesTable
            notes={pageItems}
            onAdd={() => setDrawerOpen(true)}
          />
          <Pagination
            page={page}
            totalPages={totalPages}
            totalItems={filtered.length}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
            label="notes"
          />
        </>
      )}

      <NewNoteDrawer
        open={drawerOpen}
        existing={notes}
        initialBillId={billId}
        onClose={() => setDrawerOpen(false)}
        onSave={(note) => {
          setNotes((prev) => [note, ...prev]);
          setPage(1);
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
