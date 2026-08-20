"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Ban, Pencil, Wrench } from "lucide-react";
import { toast } from "sonner";
import type { KarigarProfile } from "@/types";
import { StatusBadge } from "@/components/common/StatusBadge";
import { StatCard } from "@/components/common/StatCard";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
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

interface KarigarDetailPageProps {
  karigar: KarigarProfile;
  onUpdate: (karigar: KarigarProfile) => void;
}

function paymentLabel(type: KarigarProfile["paymentType"]) {
  if (type === "PIECE_RATE") return "Piece Rate";
  if (type === "WEEKLY_SALARY") return "Weekly Salary";
  return "Both";
}

export function KarigarDetailPage({ karigar, onUpdate }: KarigarDetailPageProps) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={() => router.push("/masters/karigar")}
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
              {karigar.party.city}, {karigar.party.country} ·{" "}
              {karigar.party.contact}
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
          >
            <Ban className="size-4" />
            {karigar.isActive ? "Deactivate" : "Activate"}
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
              : formatCurrency(karigar.weeklySalary)
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
                karigar.operations.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      {item.operation.name}
                    </TableCell>
                    <TableCell>
                      <StatusBadge
                        label={
                          item.operation.stage.charAt(0) +
                          item.operation.stage.slice(1).toLowerCase()
                        }
                        variant={
                          item.operation.stage === "CUTTING"
                            ? "cutting"
                            : item.operation.stage === "PRINTING"
                              ? "printing"
                              : item.operation.stage === "COLORING"
                                ? "coloring"
                                : item.operation.stage === "STITCHING"
                                  ? "stitching"
                                  : "finishing"
                        }
                      />
                    </TableCell>
                    <TableCell>
                      ₹{item.operation.ratePerPiece.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <KarigarDrawer
        open={editOpen}
        onClose={() => setEditOpen(false)}
        karigar={karigar}
        onSave={onUpdate}
      />

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title={karigar.isActive ? "Deactivate karigar?" : "Activate karigar?"}
        description={
          karigar.isActive
            ? "This karigar will no longer be available for production assignment."
            : "This karigar will become available for production assignment."
        }
        confirmLabel={karigar.isActive ? "Deactivate" : "Activate"}
        onConfirm={() => {
          onUpdate({ ...karigar, isActive: !karigar.isActive });
          toast.success(
            karigar.isActive ? "Karigar deactivated" : "Karigar activated"
          );
        }}
      />
    </div>
  );
}
