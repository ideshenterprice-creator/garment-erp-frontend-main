"use client";

import { useMemo, useState } from "react";
import { Download, FileSearch } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  accountsParties,
  buildRunningBalances,
  mockStatementByParty,
} from "@/mock/accounts";
import { PageHeader } from "@/components/common/PageHeader";
import {
  AccountStatementFilter,
  type StatementFilters,
} from "@/components/modules/accounts/AccountStatementFilter";
import { AccountStatementSummary } from "@/components/modules/accounts/AccountStatementSummary";
import { AccountStatementTable } from "@/components/modules/accounts/AccountStatementTable";
import { Button } from "@/components/ui/button";

const defaultFilters: StatementFilters = {
  partyId: "party-1",
  fromDate: "2024-01-01",
  toDate: "2024-02-28",
};

export default function AccountStatementPage() {
  const [filters, setFilters] = useState<StatementFilters>(defaultFilters);
  const [shown, setShown] = useState(false);
  const [applied, setApplied] = useState<StatementFilters | null>(null);

  const party = accountsParties.find((p) => p.id === applied?.partyId);
  const partyName =
    party?.name === "Al Reem"
      ? "Al Reem Trading"
      : party?.name ?? "Selected Party";

  const rows = useMemo(() => {
    if (!applied) return [];
    const source =
      mockStatementByParty[applied.partyId] ??
      mockStatementByParty["party-1"] ??
      [];
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
    const outstanding = rows.length
      ? rows[rows.length - 1].balance
      : 0;
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

  return (
    <div>
      <PageHeader
        title="Account Statement"
        subtitle="View all transactions for any party."
        actionButton={
          <Button
            type="button"
            variant="outline"
            onClick={() => toast.message("Export coming soon.")}
          >
            <Download className="size-4" />
            Export to Excel
          </Button>
        }
      />

      <AccountStatementFilter
        filters={filters}
        onChange={setFilters}
        onShow={() => {
          if (!filters.partyId || !filters.fromDate || !filters.toDate) {
            toast.error("Select a party and date range");
            return;
          }
          setApplied(filters);
          setShown(true);
        }}
      />

      {!shown ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white px-6 py-20 text-center">
          <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
            <FileSearch className="size-5" />
          </div>
          <h3 className="text-base font-semibold text-slate-900">
            No statement loaded
          </h3>
          <p className="mt-1 max-w-md text-sm text-muted-foreground">
            Select a party and date range to view their account statement.
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
          <div className="mt-4 flex justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => toast.message("Export coming soon.")}
            >
              <Download className="size-4" />
              Export to Excel
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
