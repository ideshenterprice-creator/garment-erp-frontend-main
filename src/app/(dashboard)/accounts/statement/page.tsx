"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { FileSearch } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { TableSkeleton } from "@/components/common/LoadingSpinner";
import {
  AccountStatementFilter,
  type StatementFilters,
} from "@/components/modules/accounts/AccountStatementFilter";
import { AccountStatementSummary } from "@/components/modules/accounts/AccountStatementSummary";
import { AccountStatementTable } from "@/components/modules/accounts/AccountStatementTable";
import { Button } from "@/components/ui/button";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { toIsoDate, todayInputValue } from "@/lib/accounts";
import { getAccountStatement, exportAccountStatement } from "@/services/accounts.service";
import { getErrorMessage } from "@/lib/errorHandler";

function yearStartInputValue(): string {
  return `${new Date().getUTCFullYear()}-01-01`;
}

function AccountStatementContent() {
  const searchParams = useSearchParams();
  const partyIdParam = searchParams.get("partyId");

  const [filters, setFilters] = useState<StatementFilters>({
    partyId: partyIdParam ?? "",
    fromDate: yearStartInputValue(),
    toDate: todayInputValue(),
  });
  const [applied, setApplied] = useState<StatementFilters>({
    partyId: partyIdParam ?? "",
    fromDate: yearStartInputValue(),
    toDate: todayInputValue(),
  });
  const [shouldFetch, setShouldFetch] = useState(Boolean(partyIdParam));

  useEffect(() => {
    if (!partyIdParam) return;
    const next: StatementFilters = {
      partyId: partyIdParam,
      fromDate: yearStartInputValue(),
      toDate: todayInputValue(),
    };
    setFilters(next);
    setApplied(next);
    setShouldFetch(true);
  }, [partyIdParam]);

  const statementParams = {
    partyId: applied.partyId,
    from: applied.fromDate ? toIsoDate(applied.fromDate) : undefined,
    to: applied.toDate ? toIsoDate(applied.toDate) : undefined,
  };

  const statementQuery = useQuery({
    queryKey: [
      ...QUERY_KEYS.ACCOUNT_STATEMENT,
      {
        partyId: applied.partyId,
        from: applied.fromDate,
        to: applied.toDate,
      },
    ],
    queryFn: () => getAccountStatement(statementParams),
    enabled:
      shouldFetch &&
      Boolean(applied.partyId) &&
      Boolean(applied.fromDate) &&
      Boolean(applied.toDate),
  });

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
    setShouldFetch(true);
  }

  const statement = statementQuery.data?.data;
  const lastTxn = statement?.summary.lastTransactionDate
    ? format(new Date(statement.summary.lastTransactionDate), "dd MMM yyyy")
    : "—";

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

      {!shouldFetch ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center">
          <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
            <FileSearch className="size-5" />
          </div>
          <h3 className="text-base font-semibold text-slate-900">
            Select a party and date range
          </h3>
          <p className="mt-1 max-w-md text-sm text-muted-foreground">
            Select a party and date range to view their account statement.
          </p>
        </div>
      ) : statementQuery.isLoading ? (
        <TableSkeleton rows={6} />
      ) : statementQuery.isError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-sm text-red-700">Failed to load statement.</p>
          <Button
            type="button"
            variant="outline"
            className="mt-3"
            onClick={() => void statementQuery.refetch()}
          >
            Retry
          </Button>
        </div>
      ) : !statement || statement.transactions.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center">
          <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
            <FileSearch className="size-5" />
          </div>
          <h3 className="text-base font-semibold text-slate-900">
            No transactions in this period
          </h3>
          <p className="mt-1 max-w-md text-sm text-muted-foreground">
            Adjust the date range
            {statement?.party.name ? ` for ${statement.party.name}` : ""} and
            click Show Statement.
          </p>
        </div>
      ) : (
        <>
          <AccountStatementSummary
            totalBilled={statement.summary.totalBilled}
            totalReceived={statement.summary.totalReceived}
            outstanding={statement.summary.outstanding}
            lastTransactionDate={lastTxn}
          />
          <AccountStatementTable
            rows={statement.transactions}
            partyName={statement.party.name}
            closingBalance={statement.closingBalance}
            balanceType={statement.balanceType}
            onExport={() => {
              void exportAccountStatement(statementParams)
                .then(() => toast.success("Statement exported."))
                .catch((error) =>
                  toast.error(getErrorMessage(error, "Export failed."))
                );
            }}
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
