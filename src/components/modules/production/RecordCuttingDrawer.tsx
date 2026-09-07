"use client";

import { useEffect, useMemo, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { CreateCuttingPayload, Party, PurchaseOrder } from "@/types";
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
import {
  emptySizeBreakdown,
  SIZE_FIELD_KEYS,
  SIZE_FIELD_LABELS,
  sumSizeBreakdown,
  todayInputValue,
  toIsoDate,
} from "@/lib/production";
import { formatCurrency } from "@/lib/utils";
import { getIssues } from "@/services/inventory.service";
import { getKarigars } from "@/services/masters.service";
import { createCuttingEntry } from "@/services/production.service";
import { getPurchaseOrderById } from "@/services/purchaseOrders.service";

const cuttingSchema = z
  .object({
    entryDate: z.string().min(1, "Date is required"),
    poId: z.string().uuid("Linked PO is required"),
    poItemId: z.string().uuid("Design is required"),
    bundleId: z.string().uuid("Bundle is required"),
    karigarId: z.string().uuid("Karigar is required"),
    fabricIssuedKg: z.number().min(0, "Fabric issued must be 0 or more"),
    wastageKg: z.number().min(0, "Wastage must be 0 or more"),
    qty_0_3M: z.number().min(0),
    qty_3_6M: z.number().min(0),
    qty_6_9M: z.number().min(0),
    qty_9_12M: z.number().min(0),
    qty_12_18M: z.number().min(0),
    qty_18_24M: z.number().min(0),
  })
  .superRefine((values, ctx) => {
    const total =
      values.qty_0_3M +
      values.qty_3_6M +
      values.qty_6_9M +
      values.qty_9_12M +
      values.qty_12_18M +
      values.qty_18_24M;
    if (total <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["qty_0_3M"],
        message: "At least one size quantity must be greater than 0",
      });
    }
  });

type CuttingFormValues = z.infer<typeof cuttingSchema>;

interface RecordCuttingDrawerProps {
  open: boolean;
  onClose: () => void;
  purchaseOrders: PurchaseOrder[];
  karigars: Party[];
}

export function RecordCuttingDrawer({
  open,
  onClose,
  purchaseOrders,
  karigars,
}: RecordCuttingDrawerProps) {
  const queryClient = useQueryClient();
  const lastPrefillBundleId = useRef("");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CuttingFormValues>({
    resolver: zodResolver(cuttingSchema),
    defaultValues: {
      entryDate: todayInputValue(),
      poId: "",
      poItemId: "",
      bundleId: "",
      karigarId: "",
      fabricIssuedKg: 0,
      wastageKg: 0,
      ...emptySizeBreakdown(),
    },
  });

  const poId = watch("poId");
  const poItemId = watch("poItemId");
  const bundleId = watch("bundleId");
  const karigarId = watch("karigarId");
  const sizes = {
    qty_0_3M: Number(watch("qty_0_3M") || 0),
    qty_3_6M: Number(watch("qty_3_6M") || 0),
    qty_6_9M: Number(watch("qty_6_9M") || 0),
    qty_9_12M: Number(watch("qty_9_12M") || 0),
    qty_12_18M: Number(watch("qty_12_18M") || 0),
    qty_18_24M: Number(watch("qty_18_24M") || 0),
  };
  const totalPieces = sumSizeBreakdown(sizes);

  const poDetailQuery = useQuery({
    queryKey: [...QUERY_KEYS.PURCHASE_ORDERS, poId],
    queryFn: () => getPurchaseOrderById(poId),
    enabled: open && Boolean(poId),
  });

  const issuesQuery = useQuery({
    queryKey: [
      ...QUERY_KEYS.ISSUES,
      { poId, issueType: "CUTTING", limit: 100 },
    ],
    queryFn: () => getIssues({ poId, issueType: "CUTTING", limit: 100 }),
    enabled: open && Boolean(poId),
  });

  const karigarProfilesQuery = useQuery({
    queryKey: [...QUERY_KEYS.KARIGARS, { limit: 100 }],
    queryFn: () => getKarigars({ limit: 100 }),
    enabled: open,
  });

  const designs = poDetailQuery.data?.data.items ?? [];

  const cuttingBundles = useMemo(() => {
    const issues = issuesQuery.data?.data.data ?? [];
    return issues.flatMap((issue) =>
      (issue.bundles ?? [])
        .filter((bundle) => bundle.currentStage === "CUTTING")
        .filter(() => !poItemId || issue.poItemId === poItemId || !issue.poItemId)
        .map((bundle) => ({
          ...bundle,
          issueKarigarId: issue.karigarId,
          fabricIssued: Number(issue.quantityIssued),
          designFromIssue: issue.poItemId,
        }))
    );
  }, [issuesQuery.data, poItemId]);

  const cuttingOp = useMemo(() => {
    const profiles = karigarProfilesQuery.data?.data.data ?? [];
    const profile = profiles.find((p) => p.partyId === karigarId);
    return profile?.operations.find((op) => op.stage === "CUTTING");
  }, [karigarProfilesQuery.data, karigarId]);

  const rate = Number(cuttingOp?.ratePerPiece ?? 0);
  const amountDue = totalPieces * rate;

  useEffect(() => {
    if (!open) return;
    lastPrefillBundleId.current = "";
    reset({
      entryDate: todayInputValue(),
      poId: "",
      poItemId: "",
      bundleId: "",
      karigarId: "",
      fabricIssuedKg: 0,
      wastageKg: 0,
      ...emptySizeBreakdown(),
    });
  }, [open, reset]);

  useEffect(() => {
    if (!bundleId) {
      lastPrefillBundleId.current = "";
      return;
    }
    if (lastPrefillBundleId.current === bundleId) return;
    const bundle = cuttingBundles.find((item) => item.id === bundleId);
    if (!bundle) return;
    setValue("karigarId", bundle.issueKarigarId, {
      shouldValidate: true,
    });
    setValue("fabricIssuedKg", bundle.fabricIssued, {
      shouldValidate: true,
    });
    lastPrefillBundleId.current = bundleId;
  }, [bundleId, cuttingBundles, setValue]);

  useEffect(() => {
    if (!poId) {
      setValue("poItemId", "");
      setValue("bundleId", "");
    }
  }, [poId, setValue]);

  const createMutation = useMutation({
    mutationFn: (data: CreateCuttingPayload) => createCuttingEntry(data),
    onSuccess: (response) => {
      const pay =
        response.data.paymentAmount ??
        Number(response.data.payment?.amountDue ?? amountDue);
      toast.success(
        `Cutting entry saved. Payment of ${formatCurrency(pay)} calculated.`
      );
      void queryClient.invalidateQueries({
        queryKey: [...QUERY_KEYS.PRODUCTION, "cutting"],
      });
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.KARIGAR_PAYMENTS,
      });
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.PURCHASE_ORDERS,
      });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BUNDLES });
      onClose();
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to save cutting entry."));
    },
  });

  function onSubmit(values: CuttingFormValues) {
    createMutation.mutate({
      entryDate: toIsoDate(values.entryDate),
      bundleId: values.bundleId,
      poId: values.poId,
      poItemId: values.poItemId,
      karigarId: values.karigarId,
      fabricIssuedKg: values.fabricIssuedKg,
      wastageKg: values.wastageKg,
      qty_0_3M: values.qty_0_3M,
      qty_3_6M: values.qty_3_6M,
      qty_6_9M: values.qty_6_9M,
      qty_9_12M: values.qty_9_12M,
      qty_12_18M: values.qty_12_18M,
      qty_18_24M: values.qty_18_24M,
    });
  }

  return (
    <DrawerForm
      open={open}
      onClose={() => {
        if (!createMutation.isPending) onClose();
      }}
      title="Record Cutting Entry"
      description="Capture size-wise cutting output and wastage"
      footer={
        <div className="flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={createMutation.isPending}
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="record-cutting-form"
            disabled={createMutation.isPending}
            className="bg-[#1b3a3a] text-white hover:bg-[#1b3a3a]/90"
          >
            {createMutation.isPending ? "Saving..." : "Save Entry"}
          </Button>
        </div>
      }
    >
      <form
        id="record-cutting-form"
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label>Entry Date *</Label>
            <Input type="date" {...register("entryDate")} />
            {errors.entryDate ? (
              <p className="text-sm text-destructive">
                {errors.entryDate.message}
              </p>
            ) : null}
          </div>
          <div className="flex flex-col gap-2">
            <Label>Linked PO *</Label>
            <Select
              value={poId || undefined}
              onValueChange={(value) =>
                setValue("poId", value, { shouldValidate: true })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select PO" />
              </SelectTrigger>
              <SelectContent>
                {purchaseOrders.map((po) => (
                  <SelectItem key={po.id} value={po.id}>
                    {po.poNumber}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.poId ? (
              <p className="text-sm text-destructive">{errors.poId.message}</p>
            ) : null}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label>Design No *</Label>
            <Select
              value={poItemId || undefined}
              onValueChange={(value) => {
                setValue("poItemId", value, { shouldValidate: true });
                setValue("bundleId", "");
              }}
              disabled={!poId || poDetailQuery.isLoading}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    !poId
                      ? "Select PO first"
                      : poDetailQuery.isLoading
                        ? "Loading..."
                        : "Select design"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {designs.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.designNumber}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.poItemId ? (
              <p className="text-sm text-destructive">
                {errors.poItemId.message}
              </p>
            ) : null}
          </div>
          <div className="flex flex-col gap-2">
            <Label>Bundle No *</Label>
            <Select
              value={bundleId || undefined}
              onValueChange={(value) =>
                setValue("bundleId", value, { shouldValidate: true })
              }
              disabled={!poId || issuesQuery.isLoading}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    issuesQuery.isLoading
                      ? "Loading..."
                      : "Select CUTTING bundle"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {cuttingBundles.map((bundle) => (
                  <SelectItem key={bundle.id} value={bundle.id}>
                    {bundle.bundleNumber}
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
            <Label>Karigar *</Label>
            <Select
              value={karigarId || undefined}
              onValueChange={(value) =>
                setValue("karigarId", value, { shouldValidate: true })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Auto from bundle / select" />
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
          <div className="flex flex-col gap-2">
            <Label>Fabric Issued (kg)</Label>
            <Input
              type="number"
              min={0}
              step="0.01"
              {...register("fabricIssuedKg", { valueAsNumber: true })}
            />
            {errors.fabricIssuedKg ? (
              <p className="text-sm text-destructive">
                {errors.fabricIssuedKg.message}
              </p>
            ) : null}
          </div>
        </div>

        <div>
          <Label className="mb-2 block">Size Quantities *</Label>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {SIZE_FIELD_KEYS.map((key) => (
              <div key={key} className="flex flex-col gap-1">
                <Label className="text-xs text-slate-500">
                  {SIZE_FIELD_LABELS[key]}
                </Label>
                <Input
                  type="number"
                  min={0}
                  {...register(key, { valueAsNumber: true })}
                />
              </div>
            ))}
          </div>
          {errors.qty_0_3M ? (
            <p className="mt-1 text-sm text-destructive">
              {errors.qty_0_3M.message}
            </p>
          ) : null}
          <p className="mt-2 text-sm font-medium text-slate-700">
            Total Pieces: {totalPieces.toLocaleString("en-IN")}
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <Label>Wastage (kg)</Label>
          <Input
            type="number"
            min={0}
            step="0.01"
            {...register("wastageKg", { valueAsNumber: true })}
          />
          {errors.wastageKg ? (
            <p className="text-sm text-destructive">
              {errors.wastageKg.message}
            </p>
          ) : null}
        </div>

        <KarigarPaymentBox
          operationName={cuttingOp?.name ?? "Cutting"}
          rate={rate}
          pieces={totalPieces}
          amountDue={amountDue}
          piecesLabel="Pieces Cut"
        />
      </form>
    </DrawerForm>
  );
}
