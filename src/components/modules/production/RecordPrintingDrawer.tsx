"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { CreatePrintingPayload, Party, PurchaseOrder } from "@/types";
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
  createPrintingEntry,
  getBundles,
  getCuttingEntries,
} from "@/services/production.service";

const printingSchema = z
  .object({
    entryDate: z.string().min(1),
    bundleId: z.string().uuid("Bundle is required"),
    poId: z.string().uuid("PO is required"),
    karigarId: z.string().uuid("Karigar is required"),
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

type PrintingFormValues = z.infer<typeof printingSchema>;

interface RecordPrintingDrawerProps {
  open: boolean;
  onClose: () => void;
  purchaseOrders: PurchaseOrder[];
  karigars: Party[];
}

export function RecordPrintingDrawer({
  open,
  onClose,
  purchaseOrders,
  karigars,
}: RecordPrintingDrawerProps) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PrintingFormValues>({
    resolver: zodResolver(printingSchema),
    defaultValues: {
      entryDate: todayInputValue(),
      bundleId: "",
      poId: "",
      karigarId: "",
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
      { currentStage: "PRINTING", limit: 100 },
    ],
    queryFn: () => getBundles({ currentStage: "PRINTING", limit: 100 }),
    enabled: open,
  });

  const cuttingQuery = useQuery({
    queryKey: [...QUERY_KEYS.PRODUCTION, "cutting", { bundleId, limit: 1 }],
    queryFn: () => getCuttingEntries({ bundleId, limit: 1 }),
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
    cuttingQuery.data?.data.data[0]?.totalPiecesCut ?? 0
  );
  const exceeded =
    piecesReceived > 0 && piecesReturned + piecesRejected > piecesReceived;

  const printingOp = useMemo(() => {
    const profile = (profilesQuery.data?.data.data ?? []).find(
      (p) => p.partyId === karigarId
    );
    return (
      profile?.operations.find((op) =>
        op.name.toUpperCase().includes("PRINT")
      ) ?? profile?.operations.find((op) => op.stage === "PRINTING")
    );
  }, [profilesQuery.data, karigarId]);

  const rate = Number(printingOp?.ratePerPiece ?? 0);
  const amountDue = piecesReturned * rate;

  useEffect(() => {
    if (!open) return;
    reset({
      entryDate: todayInputValue(),
      bundleId: "",
      poId: "",
      karigarId: "",
      piecesReturned: 0,
      piecesRejected: 0,
    });
  }, [open, reset]);

  useEffect(() => {
    if (!selectedBundle) return;
    setValue("poId", selectedBundle.poId, { shouldValidate: true });
  }, [selectedBundle, setValue]);

  const createMutation = useMutation({
    mutationFn: (data: CreatePrintingPayload) => createPrintingEntry(data),
    onSuccess: (response) => {
      const pay =
        response.data.paymentAmount ??
        Number(response.data.payment?.amountDue ?? amountDue);
      toast.success(
        `Printing entry saved. Payment of ${formatCurrency(pay)} calculated.`
      );
      void queryClient.invalidateQueries({
        queryKey: [...QUERY_KEYS.PRODUCTION, "printing"],
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
      toast.error(getErrorMessage(error, "Failed to save printing entry."));
    },
  });

  return (
    <DrawerForm
      open={open}
      onClose={() => {
        if (!createMutation.isPending) onClose();
      }}
      title="Record Printing Entry"
      description="Record printed pieces returned from the printer"
      footer={
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="record-printing-form"
            disabled={createMutation.isPending || exceeded}
            className="bg-[#1b3a3a] text-white hover:bg-[#1b3a3a]/90"
          >
            {createMutation.isPending ? "Saving..." : "Save Entry"}
          </Button>
        </div>
      }
    >
      <form
        id="record-printing-form"
        onSubmit={handleSubmit((values) =>
          createMutation.mutate({
            entryDate: toIsoDate(values.entryDate),
            bundleId: values.bundleId,
            poId: values.poId,
            karigarId: values.karigarId,
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
            <Label>Bundle (PRINTING) *</Label>
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
          operationName={printingOp?.name ?? "Printing"}
          rate={rate}
          pieces={piecesReturned}
          amountDue={amountDue}
          piecesLabel="Pieces Returned"
        />
      </form>
    </DrawerForm>
  );
}
