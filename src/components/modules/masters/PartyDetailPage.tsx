"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Ban,
  Building2,
  Clock3,
  Info,
  Pencil,
  Trash2,
} from "lucide-react";
import { format, subDays } from "date-fns";
import { toast } from "sonner";
import type { Party } from "@/types";
import { StatusBadge } from "@/components/common/StatusBadge";
import {
  ConfirmDialog,
  PERMANENT_DELETE,
} from "@/components/common/ConfirmDialog";
import { TableSkeleton } from "@/components/common/LoadingSpinner";
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
import { QUERY_KEYS } from "@/constants/queryKeys";
import { formatCurrency } from "@/lib/utils";
import { getErrorMessage } from "@/lib/errorHandler";
import { togglePartyStatus, deleteParty } from "@/services/masters.service";
import { getAccountStatement } from "@/services/accounts.service";

interface PartyDetailPageProps {
  party: Party;
}

const PREVIEW_LIMIT = 5;

export function PartyDetailPage({ party }: PartyDetailPageProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [editOpen, setEditOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const from = format(subDays(new Date(), 90), "yyyy-MM-dd");
  const to = format(new Date(), "yyyy-MM-dd");

  const {
    data: statementResponse,
    isLoading: statementLoading,
  } = useQuery({
    queryKey: [...QUERY_KEYS.ACCOUNT_STATEMENT, { partyId: party.id, from, to }],
    queryFn: () =>
      getAccountStatement({
        partyId: party.id,
        from,
        to,
      }),
  });

  const transactions =
    statementResponse?.data.transactions.slice(-PREVIEW_LIMIT).reverse() ?? [];

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      togglePartyStatus(id, isActive),
    onSuccess: (_, variables) => {
      const action = variables.isActive ? "activated" : "deactivated";
      toast.success(`Party ${action}.`);
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PARTIES });
      setConfirmOpen(false);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to update party status."));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteParty(id),
    onSuccess: () => {
      toast.success("Party deleted permanently.");
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PARTIES });
      router.push(ROUTES.MASTERS.PARTY);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to delete party."));
    },
  });

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
              </h1>
              <StatusBadge
                label={typeLabel(party.type)}
                variant={typeVariant(party.type)}
              />
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {party.city || "—"}, {party.country || "—"} — Added{" "}
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
            disabled={toggleStatusMutation.isPending}
          >
            <Ban className="size-4" />
            {party.isActive ? "Deactivate" : "Activate"}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
            onClick={() => setDeleteOpen(true)}
            disabled={deleteMutation.isPending}
          >
            <Trash2 className="size-4" />
            Delete Party
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
                {party.contact || "—"}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                City / Location
              </p>
              <p className="mt-1 text-sm font-medium text-slate-900">
                {party.city || "—"}, {party.country || "—"}
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
          <button
            type="button"
            className="text-sm font-medium text-[#1b3a3a] hover:underline"
            onClick={() =>
              router.push(`${ROUTES.ACCOUNTS.STATEMENT}?partyId=${party.id}`)
            }
          >
            View Full Statement →
          </button>
        </div>
        {statementLoading ? (
          <TableSkeleton rows={3} />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Debit</TableHead>
                  <TableHead>Credit</TableHead>
                  <TableHead>Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center text-muted-foreground"
                    >
                      No transactions yet
                    </TableCell>
                  </TableRow>
                ) : (
                  transactions.map((txn) => (
                    <TableRow key={`${txn.referenceId}-${txn.date}-${txn.balance}`}>
                      <TableCell>
                        {format(new Date(txn.date), "dd MMM yyyy")}
                      </TableCell>
                      <TableCell className="font-medium">
                        {txn.description}
                      </TableCell>
                      <TableCell>
                        <StatusBadge
                          label={txn.referenceType.replaceAll("_", " ")}
                          variant="pending"
                        />
                      </TableCell>
                      <TableCell>
                        {txn.debit > 0 ? formatCurrency(txn.debit) : "—"}
                      </TableCell>
                      <TableCell>
                        {txn.credit > 0 ? formatCurrency(txn.credit) : "—"}
                      </TableCell>
                      <TableCell>{formatCurrency(txn.balance)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <PartyDrawer
        open={editOpen}
        onClose={() => setEditOpen(false)}
        party={party}
      />

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => {
          if (!toggleStatusMutation.isPending) setConfirmOpen(false);
        }}
        title={party.isActive ? "Deactivate party?" : "Activate party?"}
        description={
          party.isActive
            ? "This party will no longer be available for new transactions."
            : "This party will become available for new transactions."
        }
        confirmLabel={party.isActive ? "Deactivate" : "Activate"}
        variant="default"
        onConfirm={() => {
          toggleStatusMutation.mutate({
            id: party.id,
            isActive: !party.isActive,
          });
        }}
      />

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => {
          if (!deleteMutation.isPending) setDeleteOpen(false);
        }}
        {...PERMANENT_DELETE}
        description={`${PERMANENT_DELETE.description} ${party.name} will be deleted.`}
        onConfirm={() => {
          deleteMutation.mutate(party.id);
        }}
      />
    </div>
  );
}
