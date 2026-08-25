"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { CreateFinishingPayload, Party, PurchaseOrder } from "@/types";
import { DrawerForm } from "@/components/common/DrawerForm";
import { KarigarPaymentBox } from "@/components/modules/production/KarigarPaymentBox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { getErrorMessage } from "@/lib/errorHandler";
import { todayInputValue, toIsoDate } from "@/lib/production";
import { formatCurrency } from "@/lib/utils";
import { getKarigars } from "@/services/masters.service";
import {
  createFinishingEntry,
  getBundles,
  getStitchingEntries,
} from "@/services/production.service";

const finishingSchema = z
  .object({
    entryDate: z.string().min(1),
    bundleId: z.string().uuid("Bundle is required"),
    poId: z.string().uuid("PO is required"),
    karigarId: z.string().uuid("Karigar is required"),
    operationId: z.string().uuid("Operation is required"),
    piecesCompleted: z.number().int().min(1, "Pieces completed is required"),
  })
  .superRefine((values, ctx) => {
    if (values.piecesCompleted <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["piecesCompleted"],
        message: "Completed pieces required",
      });
    }
  });

type FinishingFormValues = z.infer<typeof finishingSchema>;

interface RecordFinishingDrawerProps {
  open: boolean;
  onClose: () => void;
  purchaseOrders: PurchaseOrder[];
  karigars: Party[];
}

export function RecordFinishingDrawer({
  open,
  onClose,
  purchaseOrders,
  karigars,
}: RecordFinishingDrawerProps) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FinishingFormValues>({
    resolver: zodResolver(finishingSchema),
    defaultValues: {
      entryDate: todayInputValue(),
      bundleId: "",
      poId: "",
      karigarId: "",
      operationId: "",
      piecesCompleted: 0,
    },
  });

  const bundleId = watch("bundleId");
  const karigarId = watch("karigarId");
  const operationId = watch("operationId");
  const piecesCompleted = Number(watch("piecesCompleted") || 0);

  const bundlesQuery = useQuery({
    queryKey: [
      ...QUERY_KEYS.BUNDLES,
      { currentStage: "FINISHING", limit: 100 },
    ],
    queryFn: () => getBundles({ currentStage: "FINISHING", limit: 100 }),
    enabled: open,
  });

  const stitchingQuery = useQuery({
    queryKey: [
      ...QUERY_KEYS.PRODUCTION,
      "stitching",
      { bundleId, limit: 5 },
    ],
    queryFn: () => getStitchingEntries({ bundleId, limit: 5 }),
    enabled: open && Boolean(bundleId),
  });

  const profilesQuery = useQuery({
    queryKey: [...QUERY_KEYS.KARIGARS, { limit: 100 }],
    queryFn: () => getKarigars({ limit: 100 }),
    enabled: open,
  });

  const bundles = bundlesQuery.data?.data.data ?? [];
  const selectedBundle = bundles.find((b) => b.id === bundleId);

  const stitchingEntries = stitchingQuery.data?.data.data ?? [];
  const piecesReceived = useMemo(() => {
    if (stitchingEntries.length === 0) return 0;
    return Math.max(
      ...stitchingEntries.map((entry) => Number(entry.piecesReturned ?? 0))
    );
  }, [stitchingEntries]);

  const exceeded = piecesReceived > 0 && piecesCompleted > piecesReceived;

  const finishingOps = useMemo(() => {
    if (!karigarId) return [];
    const profile = (profilesQuery.data?.data.data ?? []).find(
      (p) => p.partyId === karigarId
    );
    return (profile?.operations ?? []).filter(
      (op) => op.stage === "FINISHING"
    );
  }, [profilesQuery.data, karigarId]);

  const selectedOp = finishingOps.find((op) => op.id === operationId);
  const rate = Number(selectedOp?.ratePerPiece ?? 0);
  const amountDue = piecesCompleted * rate;

  useEffect(() => {
    if (!open) return;
    reset({
      entryDate: todayInputValue(),
      bundleId: "",
      poId: "",
      karigarId: "",
      operationId: "",
      piecesCompleted: 0,
    });
  }, [open, reset]);

  useEffect(() => {
    if (!selectedBundle) return;
    setValue("poId", selectedBundle.poId, { shouldValidate: true });
  }, [selectedBundle, setValue]);

  useEffect(() => {
    setValue("operationId", "", { shouldValidate: false });
  }, [karigarId, setValue]);

  const createMutation = useMutation({
    mutationFn: (data: CreateFinishingPayload) => createFinishingEntry(data),
    onSuccess: (response) => {
      const pay =
        response.data.paymentAmount ??
        Number(response.data.payment?.amountDue ?? amountDue);
      toast.success(
        `Finishing entry saved. Payment of ${formatCurrency(pay)} calculated.`
      );
      void queryClient.invalidateQueries({
        queryKey: [...QUERY_KEYS.PRODUCTION, "finishing"],
      });
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.KARIGAR_PAYMENTS,
      });
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.PURCHASE_ORDERS,
      });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BUNDLES });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.STOCK });
      onClose();
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to save finishing entry."));
    },
  });

  return (
    <DrawerForm
      open={open}
      onClose={() => {
        if (!createMutation.isPending) onClose();
      }}
      title="Record Finishing Entry"
      description="Record finished pieces and complete the bundle"
      footer={
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="record-finishing-form"
            disabled={createMutation.isPending || exceeded}
            className="bg-[#1b3a3a] text-white hover:bg-[#1b3a3a]/90"
          >
            {createMutation.isPending ? "Saving..." : "Save Entry"}
          </Button>
        </div>
      }
    >
      <form
        id="record-finishing-form"
        onSubmit={handleSubmit((values) =>
          createMutation.mutate({
            entryDate: toIsoDate(values.entryDate),
            bundleId: values.bundleId,
            poId: values.poId,
            karigarId: values.karigarId,
            operationId: values.operationId,
            piecesReceived,
            piecesCompleted: values.piecesCompleted,
          })
        )}
        className="flex flex-col gap-4"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label>Entry Date *</Label>
            <Input type="date" {...register("entryDate")} />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Bundle (FINISHING) *</Label>
            <Select
              value={bundleId || undefined}
              onValueChange={(value) =>
                setValue("bundleId", value, { shouldValidate: true })
              }
              disabled={bundlesQuery.isLoading}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    bundlesQuery.isLoading ? "Loading..." : "Select bundle"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {bundles.map((bundle) => (
                  <SelectItem key={bundle.id} value={bundle.id}>
                    {bundle.bundleNumber}
                    {bundle.po?.poNumber ? ` — ${bundle.po.poNumber}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.bundleId ? (
              <p className="text-sm text-destructive">
                {errors.bundleId.message}
              </p>
            ) : null}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label>PO</Label>
            <Input
              value={
                purchaseOrders.find((p) => p.id === watch("poId"))?.poNumber ??
                watch("poId")
              }
              readOnly
              disabled
              className="bg-slate-50"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Karigar *</Label>
            <Select
              value={karigarId || undefined}
              onValueChange={(value) =>
                setValue("karigarId", value, { shouldValidate: true })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select karigar" />
              </SelectTrigger>
              <SelectContent>
                {karigars.map((party) => (
                  <SelectItem key={party.id} value={party.id}>
                    {party.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.karigarId ? (
              <p className="text-sm text-destructive">
                {errors.karigarId.message}
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label>Operation *</Label>
          <Select
            value={operationId || undefined}
            onValueChange={(value) =>
              setValue("operationId", value, { shouldValidate: true })
            }
            disabled={!karigarId}
          >
            <SelectTrigger>
              <SelectValue
                placeholder={
                  karigarId ? "Select operation" : "Select a Karigar first"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {finishingOps.map((op) => (
                <SelectItem key={op.id} value={op.id}>
                  {op.name} (₹{Number(op.ratePerPiece).toFixed(2)}/pc)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.operationId ? (
            <p className="text-sm text-destructive">
              {errors.operationId.message}
            </p>
          ) : null}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label>Pieces Received</Label>
            <Input
              value={piecesReceived.toLocaleString("en-IN")}
              readOnly
              disabled
              className="bg-slate-50"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Pieces Completed *</Label>
            <Input
              type="number"
              min={0}
              {...register("piecesCompleted", { valueAsNumber: true })}
            />
            {errors.piecesCompleted ? (
              <p className="text-sm text-destructive">
                {errors.piecesCompleted.message}
              </p>
            ) : null}
          </div>
        </div>
        {exceeded ? (
          <p className="text-sm text-destructive">
            Completed cannot exceed received ({piecesReceived}).
          </p>
        ) : null}

        <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
          Finishing completes the bundle and adds finished goods to stock.
        </p>

        <KarigarPaymentBox
          operationName={selectedOp?.name ?? "Finishing"}
          rate={rate}
          pieces={piecesCompleted}
          amountDue={amountDue}
          piecesLabel="Pieces Completed"
        />
      </form>
    </DrawerForm>
  );
}
