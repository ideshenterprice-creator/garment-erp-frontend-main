"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { CreateColoringPayload, Party, PurchaseOrder } from "@/types";
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
  createColoringEntry,
  getBundles,
  getPrintingEntries,
} from "@/services/production.service";

const coloringSchema = z
  .object({
    entryDate: z.string().min(1),
    bundleId: z.string().uuid("Bundle is required"),
    poId: z.string().uuid("PO is required"),
    karigarId: z.string().uuid("Karigar is required"),
    colorApplied: z.string().min(1, "Color applied is required"),
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

type ColoringFormValues = z.infer<typeof coloringSchema>;

interface RecordColoringDrawerProps {
  open: boolean;
  onClose: () => void;
  purchaseOrders: PurchaseOrder[];
  karigars: Party[];
}

export function RecordColoringDrawer({
  open,
  onClose,
  purchaseOrders,
  karigars,
}: RecordColoringDrawerProps) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ColoringFormValues>({
    resolver: zodResolver(coloringSchema),
    defaultValues: {
      entryDate: todayInputValue(),
      bundleId: "",
      poId: "",
      karigarId: "",
      colorApplied: "",
      piecesReturned: 0,
      piecesRejected: 0,
    },
  });

  const bundleId = watch("bundleId");
  const karigarId = watch("karigarId");
  const piecesReturned = Number(watch("piecesReturned") || 0);
  const piecesRejected = Number(watch("piecesRejected") || 0);

  const bundlesQuery = useQuery({
    queryKey: [
      ...QUERY_KEYS.BUNDLES,
      { currentStage: "COLORING", limit: 100 },
    ],
    queryFn: () => getBundles({ currentStage: "COLORING", limit: 100 }),
    enabled: open,
  });

  const printingQuery = useQuery({
    queryKey: [...QUERY_KEYS.PRODUCTION, "printing", { bundleId, limit: 1 }],
    queryFn: () => getPrintingEntries({ bundleId, limit: 1 }),
    enabled: open && Boolean(bundleId),
  });

  const profilesQuery = useQuery({
    queryKey: [...QUERY_KEYS.KARIGARS, { limit: 100 }],
    queryFn: () => getKarigars({ limit: 100 }),
    enabled: open,
  });

  const bundles = bundlesQuery.data?.data.data ?? [];
  const selectedBundle = bundles.find((b) => b.id === bundleId);
  const piecesReceived = Number(
    printingQuery.data?.data.data[0]?.piecesReturned ?? 0
  );
  const exceeded =
    piecesReceived > 0 && piecesReturned + piecesRejected > piecesReceived;

  const coloringOp = useMemo(() => {
    const profile = (profilesQuery.data?.data.data ?? []).find(
      (p) => p.partyId === karigarId
    );
    return (
      profile?.operations.find((op) => op.stage === "COLORING") ??
      profile?.operations.find((op) =>
        op.name.toUpperCase().includes("COLOR")
      )
    );
  }, [profilesQuery.data, karigarId]);

  const rate = Number(coloringOp?.ratePerPiece ?? 0);
  const amountDue = piecesReturned * rate;

  useEffect(() => {
    if (!open) return;
    reset({
      entryDate: todayInputValue(),
      bundleId: "",
      poId: "",
      karigarId: "",
      colorApplied: "",
      piecesReturned: 0,
      piecesRejected: 0,
    });
  }, [open, reset]);

  useEffect(() => {
    if (!selectedBundle) return;
    setValue("poId", selectedBundle.poId, { shouldValidate: true });
  }, [selectedBundle, setValue]);

  const createMutation = useMutation({
    mutationFn: (data: CreateColoringPayload) => createColoringEntry(data),
    onSuccess: (response) => {
      const pay =
        response.data.paymentAmount ??
        Number(response.data.payment?.amountDue ?? amountDue);
      toast.success(
        `Coloring entry saved. Payment of ${formatCurrency(pay)} calculated.`
      );
      void queryClient.invalidateQueries({
        queryKey: [...QUERY_KEYS.PRODUCTION, "coloring"],
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
      toast.error(getErrorMessage(error, "Failed to save coloring entry."));
    },
  });

  return (
    <DrawerForm
      open={open}
      onClose={() => {
        if (!createMutation.isPending) onClose();
      }}
      title="Record Coloring Entry"
      description="Record colored pieces returned from the colorist"
      footer={
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="record-coloring-form"
            disabled={createMutation.isPending || exceeded}
            className="bg-[#1b3a3a] text-white hover:bg-[#1b3a3a]/90"
          >
            {createMutation.isPending ? "Saving..." : "Save Entry"}
          </Button>
        </div>
      }
    >
      <form
        id="record-coloring-form"
        onSubmit={handleSubmit((values) =>
          createMutation.mutate({
            entryDate: toIsoDate(values.entryDate),
            bundleId: values.bundleId,
            poId: values.poId,
            karigarId: values.karigarId,
            colorApplied: values.colorApplied,
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
            <Label>Bundle (COLORING) *</Label>
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
          <Label>Color Applied *</Label>
          <Input
            placeholder="e.g. White, Navy Blue"
            {...register("colorApplied")}
          />
          {errors.colorApplied ? (
            <p className="text-sm text-destructive">
              {errors.colorApplied.message}
            </p>
          ) : null}
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
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
            Returned + rejected cannot exceed received ({piecesReceived}).
          </p>
        ) : null}

        <KarigarPaymentBox
          operationName={coloringOp?.name ?? "Coloring"}
          rate={rate}
          pieces={piecesReturned}
          amountDue={amountDue}
          piecesLabel="Pieces Returned"
        />
      </form>
    </DrawerForm>
  );
}
