"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Ban,
  Building2,
  Clock3,
  Eye,
  Info,
  Pencil,
  Trash2,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import type { Party } from "@/types";
import {
  mockPartyTransactions,
  type PartyTransaction,
} from "@/mock/masters";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { PartyDrawer } from "@/components/modules/masters/PartyDrawer";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ROUTES } from "@/constants/routes";
import { formatCurrency } from "@/lib/utils";

interface PartyDetailPageProps {
  party: Party;
  onPartyUpdate: (party: Party) => void;
}

const PREVIEW_LIMIT = 5;

export function PartyDetailPage({ party, onPartyUpdate }: PartyDetailPageProps) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [transactions, setTransactions] = useState<PartyTransaction[]>(
    () => mockPartyTransactions[party.id] ?? []
  );
  const [deleteTxn, setDeleteTxn] = useState<PartyTransaction | null>(null);

  const visibleTransactions = useMemo(
    () => (showAll ? transactions : transactions.slice(0, PREVIEW_LIMIT)),
    [showAll, transactions]
  );

  function typeLabel(type: Party["type"]) {
    if (type === "BUYER") return "BUYER";
    if (type === "SUPPLIER") return "SUPPLIER";
    return "KARIGAR";
  }

  function typeVariant(type: Party["type"]) {
    if (type === "BUYER") return "buyer" as const;
    if (type === "SUPPLIER") return "supplier" as const;
    return "karigar" as const;
  }

  const hasBank =
    Boolean(party.bankAccount) || Boolean(party.ifsc) || Boolean(party.bankName);

  function goToFullLedger() {
    if (party.type === "BUYER") {
      router.push(`${ROUTES.ACCOUNTS.STATEMENT}?partyId=${party.id}`);
      return;
    }
    if (party.type === "SUPPLIER") {
      router.push(ROUTES.PURCHASE.REGISTER);
      return;
    }
    router.push(ROUTES.ACCOUNTS.KARIGAR_PAYMENTS);
  }

  function viewTransaction(txn: PartyTransaction) {
    if (txn.transactionId.startsWith("INV-")) {
      router.push(ROUTES.SALES.BILLS);
      return;
    }
    if (txn.transactionId.startsWith("PO-")) {
      router.push(ROUTES.PURCHASE_ORDERS.ROOT);
      return;
    }
    goToFullLedger();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={() => router.push(ROUTES.MASTERS.PARTY)}
            className="mt-1 rounded-md p-1 text-slate-500 hover:bg-slate-100"
            aria-label="Back"
          >
            <ArrowLeft className="size-5" />
          </button>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900 md:text-[28px]">
                {party.name}
                {party.name === "Al Reem" ? " Trading" : ""}
              </h1>
              <StatusBadge
                label={typeLabel(party.type)}
                variant={typeVariant(party.type)}
              />
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {party.city}, {party.country} — Added{" "}
              {format(new Date(party.createdAt), "dd MMM yyyy")}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={() => setEditOpen(true)}>
            <Pencil className="size-4" />
            Edit Party
          </Button>
          <Button
            type="button"
            variant="outline"
            className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
            onClick={() => setConfirmOpen(true)}
          >
            <Ban className="size-4" />
            {party.isActive ? "Deactivate" : "Activate"}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
          <div className="mb-4 flex items-center gap-2">
            <Info className="size-4 text-slate-500" />
            <h2 className="font-semibold text-slate-900">Party Info</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                Party Type
              </p>
              <p className="mt-1 text-sm font-medium text-slate-900">
                {party.type === "BUYER"
                  ? "Buyer"
                  : party.type === "SUPPLIER"
                    ? "Supplier"
                    : "Karigar"}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                Contact Number
              </p>
              <p className="mt-1 text-sm font-medium text-slate-900">
                {party.contact}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                City / Location
              </p>
              <p className="mt-1 text-sm font-medium text-slate-900">
                {party.city}, {party.country}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                Registration Status
              </p>
              <p className="mt-1 flex items-center gap-2 text-sm font-medium text-slate-900">
                <span
                  className={`size-2 rounded-full ${
                    party.isActive ? "bg-emerald-500" : "bg-red-500"
                  }`}
                />
                {party.isActive ? "Active" : "Inactive"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-5 text-center shadow-sm">
          <Building2 className="mb-3 size-8 text-slate-400" />
          {hasBank ? (
            <div className="w-full space-y-2 text-left text-sm">
              <p>
                <span className="text-muted-foreground">Account:</span>{" "}
                {party.bankAccount}
              </p>
              <p>
                <span className="text-muted-foreground">IFSC:</span> {party.ifsc}
              </p>
              <p>
                <span className="text-muted-foreground">Bank:</span>{" "}
                {party.bankName}
              </p>
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                Bank Details: No bank details added for this{" "}
                {party.type === "BUYER"
                  ? "buyer"
                  : party.type === "SUPPLIER"
                    ? "supplier"
                    : "karigar"}
                .
              </p>
              <button
                type="button"
                className="mt-3 text-sm font-medium text-[#1b3a3a] hover:underline"
                onClick={() => setEditOpen(true)}
              >
                + Add Details
              </button>
            </>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Clock3 className="size-4 text-slate-500" />
            <h2 className="font-semibold text-slate-900">Transaction History</h2>
          </div>
          <div className="flex items-center gap-3">
            {transactions.length > PREVIEW_LIMIT ? (
              <button
                type="button"
                className="text-sm font-medium text-[#1b3a3a] hover:underline"
                onClick={() => setShowAll((prev) => !prev)}
              >
                {showAll ? "Show less" : "View All Transactions →"}
              </button>
            ) : (
              <button
                type="button"
                className="text-sm font-medium text-[#1b3a3a] hover:underline"
                onClick={goToFullLedger}
              >
                View All Transactions →
              </button>
            )}
          </div>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transaction ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleTransactions.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center text-muted-foreground"
                  >
                    No transactions yet
                  </TableCell>
                </TableRow>
              ) : (
                visibleTransactions.map((txn) => (
                  <TableRow key={txn.id}>
                    <TableCell className="font-medium">
                      {txn.transactionId}
                    </TableCell>
                    <TableCell>{txn.type}</TableCell>
                    <TableCell>
                      {format(new Date(txn.date), "dd MMM yyyy")}
                    </TableCell>
                    <TableCell>{formatCurrency(txn.amount)}</TableCell>
                    <TableCell>
                      <StatusBadge
                        label={txn.status}
                        variant={txn.status === "PAID" ? "paid" : "pending"}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-0.5">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-8"
                          onClick={() => viewTransaction(txn)}
                        >
                          <Eye className="size-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-8 text-red-500 hover:bg-red-50"
                          onClick={() => setDeleteTxn(txn)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <PartyDrawer
        open={editOpen}
        onClose={() => setEditOpen(false)}
        party={party}
        onSave={onPartyUpdate}
      />

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title={party.isActive ? "Deactivate party?" : "Activate party?"}
        description={
          party.isActive
            ? "This party will no longer be available for new transactions."
            : "This party will become available for new transactions."
        }
        confirmLabel={party.isActive ? "Deactivate" : "Activate"}
        onConfirm={() => {
          onPartyUpdate({ ...party, isActive: !party.isActive });
          toast.success(
            party.isActive ? "Party deactivated" : "Party activated"
          );
        }}
      />

      <ConfirmDialog
        open={Boolean(deleteTxn)}
        onClose={() => setDeleteTxn(null)}
        title={`Delete ${deleteTxn?.transactionId ?? "transaction"}?`}
        description="This removes the transaction from this party history preview."
        confirmLabel="Delete"
        onConfirm={() => {
          if (!deleteTxn) return;
          setTransactions((prev) =>
            prev.filter((item) => item.id !== deleteTxn.id)
          );
          toast.success("Transaction removed");
        }}
      />
    </div>
  );
}
