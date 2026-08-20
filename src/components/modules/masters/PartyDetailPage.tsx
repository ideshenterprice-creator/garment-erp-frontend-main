"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Award,
  Ban,
  Building2,
  Clock3,
  Info,
  Pencil,
  ShoppingBag,
  Star,
  Wallet,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import type { Party } from "@/types";
import { mockPartyTransactions } from "@/mock/masters";
import { StatusBadge } from "@/components/common/StatusBadge";
import { StatCard } from "@/components/common/StatCard";
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
import { formatCurrency } from "@/lib/utils";

interface PartyDetailPageProps {
  party: Party;
  onPartyUpdate: (party: Party) => void;
}

export function PartyDetailPage({ party, onPartyUpdate }: PartyDetailPageProps) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const transactions = useMemo(
    () => mockPartyTransactions[party.id] ?? [],
    [party.id]
  );

  const totalBusiness = transactions.reduce((sum, item) => sum + item.amount, 0);
  const outstanding = transactions
    .filter((item) => item.status === "PENDING")
    .reduce((sum, item) => sum + item.amount, 0);

  function typeLabel(type: Party["type"]) {
    if (type === "BUYER") return "BUYER";
    if (type === "SUPPLIER") return "SUPPLIER";
    return "KARIGAR";
  }

  function typeVariant(type: Party["type"]) {
    if (type === "BUYER") return "supplier" as const;
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
            onClick={() => router.push("/masters/party")}
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
              <p className="mt-1 text-sm font-medium text-slate-900">{party.contact}</p>
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
                <span className="text-muted-foreground">Bank:</span> {party.bankName}
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
          <button type="button" className="text-sm font-medium text-[#1b3a3a]">
            View All Transactions →
          </button>
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
              {transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No transactions yet
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((txn) => (
                  <TableRow key={txn.id}>
                    <TableCell className="font-medium">{txn.transactionId}</TableCell>
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
                    <TableCell />
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="Total Outstanding"
          value={formatCurrency(outstanding)}
          accent="red"
          icon={<Wallet className="size-5" />}
          valueClassName="text-red-600"
        />
        <StatCard
          label="Total Business Value"
          value={formatCurrency(totalBusiness || 810000)}
          accent="gray"
          icon={<ShoppingBag className="size-5" />}
        />
        <StatCard
          label="Reliability Score"
          value="4.0/5"
          accent="orange"
          icon={<Award className="size-5" />}
          footer={
            <div className="mt-1 flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`size-3.5 ${
                    star <= 4
                      ? "fill-orange-400 text-orange-400"
                      : "text-slate-300"
                  }`}
                />
              ))}
            </div>
          }
        />
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
    </div>
  );
}
