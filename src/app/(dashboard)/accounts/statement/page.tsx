"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { FileSearch } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  accountsParties,
  buildRunningBalances,
  mockStatementByParty,
} from "@/mock/accounts";
import { PageHeader } from "@/components/common/PageHeader";
import { TableSkeleton } from "@/components/common/LoadingSpinner";
import {
  AccountStatementFilter,
  type StatementFilters,
} from "@/components/modules/accounts/AccountStatementFilter";
import { AccountStatementSummary } from "@/components/modules/accounts/AccountStatementSummary";
import { AccountStatementTable } from "@/components/modules/accounts/AccountStatementTable";

const defaultFilters: StatementFilters = {
  partyId: "party-1",
  fromDate: "2024-01-01",
  toDate: "2024-02-28",
};

function AccountStatementContent() {
  const searchParams = useSearchParams();
  const partyFromQuery = searchParams.get("partyId");

  const initialFilters: StatementFilters = {
    ...defaultFilters,
    partyId: partyFromQuery ?? defaultFilters.partyId,
  };

  const [filters, setFilters] = useState<StatementFilters>(initialFilters);
  const [applied, setApplied] = useState<StatementFilters>(initialFilters);

  useEffect(() => {
    if (!partyFromQuery) return;
    const next = { ...defaultFilters, partyId: partyFromQuery };
    setFilters(next);
    setApplied(next);
  }, [partyFromQuery]);

  const party = accountsParties.find((p) => p.id === applied.partyId);
  const partyName =
    party?.name === "Al Reem"
      ? "Al Reem Trading"
      : party?.name ?? "Selected Party";

  const rows = useMemo(() => {
    const source = mockStatementByParty[applied.partyId] ?? [];
    const filtered = source.filter((txn) => {
      if (applied.fromDate && txn.date < applied.fromDate) return false;
      if (applied.toDate && txn.date > applied.toDate) return false;
      return true;
    });
    return buildRunningBalances(filtered);
  }, [applied]);

  const summary = useMemo(() => {
    const totalBilled = rows.reduce((sum, row) => sum + row.debit, 0);
    const totalReceived = rows.reduce((sum, row) => sum + row.credit, 0);
    const outstanding = rows.length ? rows[rows.length - 1].balance : 0;
    const lastTransactionDate = rows.length
      ? format(new Date(rows[rows.length - 1].date), "dd MMM yyyy")
      : "—";
    return {
      totalBilled,
      totalReceived,
      outstanding: Math.max(0, outstanding),
      lastTransactionDate,
    };
  }, [rows]);

  const closingBalance = rows.length ? rows[rows.length - 1].balance : 0;
  const hasPartyData = Boolean(mockStatementByParty[applied.partyId]?.length);

  function showStatement() {
    if (!filters.partyId || !filters.fromDate || !filters.toDate) {
      toast.error("Select a party and date range");
      return;
    }
    if (filters.fromDate > filters.toDate) {
      toast.error("From date must be before To date");
      return;
    }
    setApplied({ ...filters });
    const selected = accountsParties.find((p) => p.id === filters.partyId);
    const label =
      selected?.name === "Al Reem"
        ? "Al Reem Trading"
        : selected?.name ?? "party";
    toast.success(`Statement loaded for ${label}`);
  }

  return (
    <div>
      <PageHeader
        title="Account Statement"
        subtitle="View all transactions for any party."
      />

      <AccountStatementFilter
        filters={filters}
        onChange={setFilters}
        onShow={showStatement}
      />

      {!hasPartyData ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center">
          <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
            <FileSearch className="size-5" />
          </div>
          <h3 className="text-base font-semibold text-slate-900">
            No transactions for this party
          </h3>
          <p className="mt-1 max-w-md text-sm text-muted-foreground">
            Try another party, or widen the date range and click Show Statement.
          </p>
        </div>
      ) : rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center">
          <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
            <FileSearch className="size-5" />
          </div>
          <h3 className="text-base font-semibold text-slate-900">
            No transactions in this period
          </h3>
          <p className="mt-1 max-w-md text-sm text-muted-foreground">
            Adjust the date range for {partyName} and click Show Statement.
          </p>
        </div>
      ) : (
        <>
          <AccountStatementSummary
            totalBilled={summary.totalBilled}
            totalReceived={summary.totalReceived}
            outstanding={summary.outstanding}
            lastTransactionDate={summary.lastTransactionDate}
          />
          <AccountStatementTable
            rows={rows}
            partyName={partyName}
            closingBalance={closingBalance}
          />
        </>
      )}
    </div>
  );
}

export default function AccountStatementPage() {
  return (
    <Suspense fallback={<TableSkeleton rows={6} />}>
      <AccountStatementContent />
    </Suspense>
  );
}
