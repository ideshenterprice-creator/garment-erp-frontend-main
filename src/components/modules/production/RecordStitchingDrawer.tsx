"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type {
  CreateStitchingPayload,
  OperationDepartment,
  Party,
  PurchaseOrder,
} from "@/types";
import { DEPARTMENT_LABELS, OPERATION_DEPARTMENTS } from "@/types";
import { DrawerForm } from "@/components/common/DrawerForm";
import {
  departmentBadgeVariant,
  StatusBadge,
} from "@/components/common/StatusBadge";
import { KarigarPaymentBox } from "@/components/modules/production/KarigarPaymentBox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { getErrorMessage } from "@/lib/errorHandler";
import { todayInputValue, toIsoDate } from "@/lib/production";
import { formatCurrency } from "@/lib/utils";
import { getKarigars } from "@/services/masters.service";
import {
  createStitchingEntry,
  getBundles,
  getColoringEntries,
} from "@/services/production.service";

const stitchingSchema = z
  .object({
    entryDate: z.string().min(1),
    bundleId: z.string().uuid("Bundle is required"),
    poId: z.string().uuid("PO is required"),
    karigarId: z.string().uuid("Karigar is required"),
    operationId: z.string().uuid("Operation is required"),
    piecesReturned: z.number().int().min(0),
    piecesRejected: z.number().int().min(0),
  })
  .superRefine((values, ctx) => {
    if (values.piecesReturned + values.piecesRejected <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["piecesReturned"],
        message: "Returned or rejected pieces required",
      });
    }
  });

type StitchingFormValues = z.infer<typeof stitchingSchema>;

interface RecordStitchingDrawerProps {
  open: boolean;
  onClose: () => void;
  purchaseOrders: PurchaseOrder[];
  karigars: Party[];
}

export function RecordStitchingDrawer({
  open,
  onClose,
  purchaseOrders,
  karigars,
}: RecordStitchingDrawerProps) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<StitchingFormValues>({
    resolver: zodResolver(stitchingSchema),
    defaultValues: {
      entryDate: todayInputValue(),
      bundleId: "",
      poId: "",
      karigarId: "",
      operationId: "",
      piecesReturned: 0,
      piecesRejected: 0,
    },
  });

  const bundleId = watch("bundleId");
  const karigarId = watch("karigarId");
  const operationId = watch("operationId");
  const piecesReturned = Number(watch("piecesReturned") || 0);
  const piecesRejected = Number(watch("piecesRejected") || 0);

  const bundlesQuery = useQuery({
    queryKey: [
      ...QUERY_KEYS.BUNDLES,
      { currentStage: "STITCHING", limit: 100 },
    ],
    queryFn: () => getBundles({ currentStage: "STITCHING", limit: 100 }),
    enabled: open,
  });

  const coloringQuery = useQuery({
    queryKey: [...QUERY_KEYS.PRODUCTION, "coloring", { bundleId, limit: 1 }],
    queryFn: () => getColoringEntries({ bundleId, limit: 1 }),
    enabled: open && Boolean(bundleId),
  });

  const profilesQuery = useQuery({
    queryKey: [...QUERY_KEYS.KARIGARS, { limit: 100 }],
    queryFn: () => getKarigars({ limit: 100 }),
    enabled: open,
  });

  const bundles = bundlesQuery.data?.data.data ?? [];
  const selectedBundle = bundles.find((b) => b.id === bundleId);
  const piecesGiven = Number(
    coloringQuery.data?.data.data[0]?.piecesReturned ?? 0
  );
  const exceeded =
    piecesGiven > 0 && piecesReturned + piecesRejected > piecesGiven;

  const stitchingOps = useMemo(() => {
    if (!karigarId) return [];
    const profile = (profilesQuery.data?.data.data ?? []).find(
      (p) => p.partyId === karigarId
    );
    return (profile?.operations ?? []).filter(
      (op) => op.stage === "STITCHING"
    );
  }, [profilesQuery.data, karigarId]);

  const stitchingOpsByDepartment = useMemo(() => {
    const grouped = new Map<
      OperationDepartment | "UNGROUPED",
      typeof stitchingOps
    >();
    for (const op of stitchingOps) {
      const key = op.departmentType ?? "UNGROUPED";
      const list = grouped.get(key) ?? [];
      list.push(op);
      grouped.set(key, list);
    }
    const orderedKeys: Array<OperationDepartment | "UNGROUPED"> = [
      ...OPERATION_DEPARTMENTS,
      "UNGROUPED",
    ];
    return orderedKeys
      .filter((key) => (grouped.get(key) ?? []).length > 0)
      .map((key) => ({
        key,
        label:
          key === "UNGROUPED"
            ? "Other Operations"
            : `${DEPARTMENT_LABELS[key]} Operations`,
        items: grouped.get(key) ?? [],
      }));
  }, [stitchingOps]);

  const selectedOp = stitchingOps.find((op) => op.id === operationId);
  const rate = Number(selectedOp?.ratePerPiece ?? 0);
  const amountDue = piecesReturned * rate;

  useEffect(() => {
    if (!open) return;
    reset({
      entryDate: todayInputValue(),
      bundleId: "",
      poId: "",
      karigarId: "",
      operationId: "",
      piecesReturned: 0,
      piecesRejected: 0,
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
    mutationFn: (data: CreateStitchingPayload) => createStitchingEntry(data),
    onSuccess: (response) => {
      const pay =
        response.data.paymentAmount ??
        Number(response.data.payment?.amountDue ?? amountDue);
      toast.success(
        `Stitching entry saved. Payment of ${formatCurrency(pay)} calculated.`
      );
      void queryClient.invalidateQueries({
        queryKey: [...QUERY_KEYS.PRODUCTION, "stitching"],
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
      toast.error(getErrorMessage(error, "Failed to save stitching entry."));
    },
  });

  return (
    <DrawerForm
      open={open}
      onClose={() => {
        if (!createMutation.isPending) onClose();
      }}
      title="Record Stitching Entry"
      description="Record stitched pieces returned from the tailor"
      footer={
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="record-stitching-form"
            disabled={createMutation.isPending || exceeded}
            className="bg-[#1b3a3a] text-white hover:bg-[#1b3a3a]/90"
          >
            {createMutation.isPending ? "Saving..." : "Save Entry"}
          </Button>
        </div>
      }
    >
      <form
        id="record-stitching-form"
        onSubmit={handleSubmit((values) =>
          createMutation.mutate({
            entryDate: toIsoDate(values.entryDate),
            bundleId: values.bundleId,
            poId: values.poId,
            karigarId: values.karigarId,
            operationId: values.operationId,
            piecesGiven,
            piecesReturned: values.piecesReturned,
            piecesRejected: values.piecesRejected,
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
            <Label>Bundle (STITCHING) *</Label>
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
              {stitchingOpsByDepartment.map((group) => (
                <SelectGroup key={group.key}>
                  <SelectLabel>{group.label}</SelectLabel>
                  {group.items.map((op) => (
                    <SelectItem key={op.id} value={op.id}>
                      <span className="flex items-center gap-2">
                        <span>
                          {op.name} (₹{Number(op.ratePerPiece).toFixed(2)}/pc)
                        </span>
                        {op.departmentType ? (
                          <StatusBadge
                            label={DEPARTMENT_LABELS[op.departmentType]}
                            variant={departmentBadgeVariant(op.departmentType)}
                          />
                        ) : null}
                      </span>
                    </SelectItem>
                  ))}
                </SelectGroup>
              ))}
            </SelectContent>
          </Select>
          {errors.operationId ? (
            <p className="text-sm text-destructive">
              {errors.operationId.message}
            </p>
          ) : null}
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="flex flex-col gap-2">
            <Label>Pieces Given</Label>
            <Input
              value={piecesGiven.toLocaleString("en-IN")}
              readOnly
              disabled
              className="bg-slate-50"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Pieces Returned *</Label>
            <Input
              type="number"
              min={0}
              {...register("piecesReturned", { valueAsNumber: true })}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Pieces Rejected</Label>
            <Input
              type="number"
              min={0}
              {...register("piecesRejected", { valueAsNumber: true })}
            />
          </div>
        </div>
        {exceeded ? (
          <p className="text-sm text-destructive">
            Returned + rejected cannot exceed given ({piecesGiven}).
          </p>
        ) : null}

        <KarigarPaymentBox
          operationName={selectedOp?.name ?? "Stitching"}
          rate={rate}
          pieces={piecesReturned}
          amountDue={amountDue}
          piecesLabel="Pieces Returned"
        />
      </form>
    </DrawerForm>
  );
}
