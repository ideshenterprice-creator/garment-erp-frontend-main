"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Ban, Pencil, Trash2, Wrench } from "lucide-react";
import { toast } from "sonner";
import type { KarigarProfile } from "@/types";
import { StatusBadge } from "@/components/common/StatusBadge";
import { StatCard } from "@/components/common/StatCard";
import {
  ConfirmDialog,
  PERMANENT_DELETE,
} from "@/components/common/ConfirmDialog";
import { TableSkeleton } from "@/components/common/LoadingSpinner";
import { KarigarDrawer } from "@/components/modules/masters/KarigarDrawer";
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
import { getErrorMessage } from "@/lib/errorHandler";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { ROUTES } from "@/constants/routes";
import { toggleKarigarStatus, deleteKarigar } from "@/services/masters.service";
import { getKarigarPayments } from "@/services/accounts.service";

interface KarigarDetailPageProps {
  karigar: KarigarProfile;
}

function paymentLabel(type: KarigarProfile["paymentType"]) {
  if (type === "PIECE_RATE") return "Piece Rate";
  if (type === "WEEKLY_SALARY") return "Weekly Salary";
  return "Both";
}

export function KarigarDetailPage({ karigar }: KarigarDetailPageProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [editOpen, setEditOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  // Accounts API filters by party id (karigar party), not profile id.
  const paymentsQuery = useQuery({
    queryKey: [
      ...QUERY_KEYS.KARIGAR_PAYMENTS,
      { karigarId: karigar.partyId, page: 1, limit: 10 },
    ],
    queryFn: () =>
      getKarigarPayments({
        karigarId: karigar.partyId,
        page: 1,
        limit: 10,
      }),
  });

  const payments = paymentsQuery.data?.data.data ?? [];

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      toggleKarigarStatus(id, isActive),
    onSuccess: (_, variables) => {
      toast.success(
        variables.isActive ? "Karigar activated." : "Karigar deactivated."
      );
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.KARIGARS });
      setConfirmOpen(false);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to update karigar status."));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteKarigar(id),
    onSuccess: () => {
      toast.success("Karigar deleted permanently.");
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.KARIGARS });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PARTIES });
      router.push(ROUTES.MASTERS.KARIGAR);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to delete karigar."));
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={() => router.push(ROUTES.MASTERS.KARIGAR)}
            className="mt-1 rounded-md p-1 text-slate-500 hover:bg-slate-100"
            aria-label="Back"
          >
            <ArrowLeft className="size-5" />
          </button>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900">
                {karigar.party.name}
              </h1>
              <StatusBadge
                label={paymentLabel(karigar.paymentType)}
                variant={
                  karigar.paymentType === "PIECE_RATE"
                    ? "piece_rate"
                    : karigar.paymentType === "WEEKLY_SALARY"
                      ? "weekly_salary"
                      : "both"
                }
              />
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {karigar.party.city || "—"}
              {karigar.party.country ? `, ${karigar.party.country}` : ""} ·{" "}
              {karigar.party.contact || "—"}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={() => setEditOpen(true)}>
            <Pencil className="size-4" />
            Edit Profile
          </Button>
          <Button
            type="button"
            variant="outline"
            className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
            onClick={() => setConfirmOpen(true)}
            disabled={toggleStatusMutation.isPending}
          >
            <Ban className="size-4" />
            {karigar.isActive ? "Deactivate" : "Activate"}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
            onClick={() => setDeleteOpen(true)}
            disabled={deleteMutation.isPending}
          >
            <Trash2 className="size-4" />
            Delete Karigar
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="Payment Type"
          value={paymentLabel(karigar.paymentType)}
          accent="blue"
          icon={<Wrench className="size-5" />}
        />
        <StatCard
          label="Weekly Salary"
          value={
            karigar.paymentType === "PIECE_RATE"
              ? "—"
              : formatCurrency(Number(karigar.weeklySalary ?? 0))
          }
          accent="yellow"
        />
        <StatCard
          label="Assigned Operations"
          value={String(karigar.operations.length).padStart(2, "0")}
          accent="purple"
        />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 font-semibold text-slate-900">Assigned Operations</h2>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Operation</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Rate / Pc</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {karigar.operations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground">
                    No operations assigned
                  </TableCell>
                </TableRow>
              ) : (
                karigar.operations.map((operation) => (
                  <TableRow key={operation.id}>
                    <TableCell className="font-medium">
                      {operation.name}
                    </TableCell>
                    <TableCell>
                      <StatusBadge
                        label={
                          operation.stage.charAt(0) +
                          operation.stage.slice(1).toLowerCase()
                        }
                        variant={
                          operation.stage === "CUTTING"
                            ? "cutting"
                            : operation.stage === "PRINTING"
                              ? "printing"
                              : operation.stage === "COLORING"
                                ? "coloring"
                                : operation.stage === "STITCHING"
                                  ? "stitching"
                                  : "finishing"
                        }
                      />
                    </TableCell>
                    <TableCell>
                      ₹{Number(operation.ratePerPiece).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="font-semibold text-slate-900">Recent Payments</h2>
          <button
            type="button"
            className="text-sm font-medium text-[#1b3a3a] hover:underline"
            onClick={() =>
              router.push(
                `${ROUTES.ACCOUNTS.KARIGAR_PAYMENTS}?karigarId=${karigar.partyId}`
              )
            }
          >
            View All Payments →
          </button>
        </div>
        {paymentsQuery.isLoading ? (
          <TableSkeleton rows={4} />
        ) : paymentsQuery.isError ? (
          <div className="flex flex-col items-center gap-2 py-6 text-center">
            <p className="text-sm text-muted-foreground">
              Could not load payment history.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void paymentsQuery.refetch()}
            >
              Try Again
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Payment #</TableHead>
                  <TableHead>Operation</TableHead>
                  <TableHead>Pieces</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center text-muted-foreground"
                    >
                      No payments yet
                    </TableCell>
                  </TableRow>
                ) : (
                  payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">
                        {payment.paymentNumber}
                      </TableCell>
                      <TableCell>{payment.operation?.name ?? "—"}</TableCell>
                      <TableCell>{payment.piecesCompleted}</TableCell>
                      <TableCell>
                        {formatCurrency(Number(payment.amountDue))}
                      </TableCell>
                      <TableCell>
                        <StatusBadge
                          label={payment.status}
                          variant={payment.status === "PAID" ? "paid" : "pending"}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <KarigarDrawer
        open={editOpen}
        onClose={() => setEditOpen(false)}
        karigar={karigar}
      />

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => {
          if (!toggleStatusMutation.isPending) setConfirmOpen(false);
        }}
        title={karigar.isActive ? "Deactivate karigar?" : "Activate karigar?"}
        description={
          karigar.isActive
            ? "This karigar will no longer be available for production assignment."
            : "This karigar will become available for production assignment."
        }
        confirmLabel={karigar.isActive ? "Deactivate" : "Activate"}
        onConfirm={() => {
          toggleStatusMutation.mutate({
            id: karigar.id,
            isActive: !karigar.isActive,
          });
        }}
      />

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => {
          if (!deleteMutation.isPending) setDeleteOpen(false);
        }}
        {...PERMANENT_DELETE}
        description={`${PERMANENT_DELETE.description} ${karigar.party.name} will be deleted.`}
        onConfirm={() => deleteMutation.mutate(karigar.id)}
      />
    </div>
  );
}
