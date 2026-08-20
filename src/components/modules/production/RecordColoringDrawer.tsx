"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Save } from "lucide-react";
import { toast } from "sonner";
import {
  getBundlesForStage,
  getRateForStage,
  mockPrintingEntries,
  mockProductionKarigars,
  mockProductionPOs,
  type MockColoringEntry,
} from "@/mock/production";
import { DrawerForm } from "@/components/common/DrawerForm";
import { KarigarPaymentBox } from "@/components/modules/production/KarigarPaymentBox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const coloringSchema = z
  .object({
    entryDate: z.string().min(1, "Date is required"),
    poId: z.string().min(1, "Linked PO is required"),
    designNumber: z.string().min(1, "Design No is required"),
    bundleNumber: z.string().min(1, "Bundle No is required"),
    karigarId: z.string().min(1, "Karigar is required"),
    colorApplied: z.string().min(1, "Color applied is required"),
    piecesReceived: z.number().positive(),
    piecesReturned: z.number().min(0),
    piecesRejected: z.number().min(0),
    notes: z.string().optional(),
  })
  .superRefine((values, ctx) => {
    if (values.piecesReturned + values.piecesRejected > values.piecesReceived) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["piecesReturned"],
        message: "Returned + rejected cannot exceed pieces received",
      });
    }
  });

type ColoringFormValues = z.infer<typeof coloringSchema>;

interface RecordColoringDrawerProps {
  open: boolean;
  onClose: () => void;
  onSave: (entry: MockColoringEntry) => void;
}

export function RecordColoringDrawer({
  open,
  onClose,
  onSave,
}: RecordColoringDrawerProps) {
  const rate = getRateForStage("COLORING");
  const printBundles = useMemo(() => getBundlesForStage("PRINTING"), []);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ColoringFormValues>({
    resolver: zodResolver(coloringSchema),
    defaultValues: {
      entryDate: "2023-10-24",
      poId: "",
      designNumber: "",
      bundleNumber: "",
      karigarId: "",
      colorApplied: "White",
      piecesReceived: 965,
      piecesReturned: 962,
      piecesRejected: 3,
      notes: "",
    },
  });

  const piecesReturned = Number(watch("piecesReturned") || 0);
  const piecesRejected = Number(watch("piecesRejected") || 0);
  const piecesReceived = Number(watch("piecesReceived") || 0);
  const amountDue = piecesReturned * rate;
  const poId = watch("poId");

  const designs = useMemo(() => {
    return mockProductionPOs.find((po) => po.id === poId)?.designs ?? [];
  }, [poId]);

  useEffect(() => {
    if (!open) return;
    const first = printBundles[0];
    const printing = mockPrintingEntries.find(
      (entry) => entry.bundleNumber === first?.bundleNumber
    );
    reset({
      entryDate: "2023-10-24",
      poId: printing?.poId ?? mockProductionPOs[0]?.id ?? "",
      designNumber: printing?.designNumber ?? "DSN-8821",
      bundleNumber: first?.bundleNumber ?? "",
      karigarId: "k-amit-k",
      colorApplied: "White",
      piecesReceived: first?.pieces ?? 965,
      piecesReturned: Math.max(0, (first?.pieces ?? 965) - 3),
      piecesRejected: 3,
      notes: "",
    });
  }, [open, reset, printBundles]);

  useEffect(() => {
    const bundle = watch("bundleNumber");
    const printing = mockPrintingEntries.find(
      (entry) => entry.bundleNumber === bundle
    );
    if (printing) {
      setValue("piecesReceived", printing.piecesReturned);
      setValue("poId", printing.poId);
      setValue("designNumber", printing.designNumber);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watch("bundleNumber"), setValue]);

  function onSubmit(values: ColoringFormValues) {
    const po = mockProductionPOs.find((item) => item.id === values.poId);
    const karigar = mockProductionKarigars.find(
      (item) => item.id === values.karigarId
    );
    const colorMap: Record<string, string> = {
      White: "#ffffff",
      Blue: "#2563eb",
      Yellow: "#eab308",
      Pink: "#ec4899",
      Red: "#dc2626",
    };

    const entry: MockColoringEntry = {
      id: `cl-${Date.now()}`,
      entryNumber: `CL-${String(Date.now()).slice(-3)}`,
      entryDate: values.entryDate,
      poId: values.poId,
      poNumber: po?.poNumber ?? values.poId,
      designNumber: values.designNumber,
      bundleNumber: values.bundleNumber,
      piecesReceived: values.piecesReceived,
      colorApplied: values.colorApplied,
      colorHex: colorMap[values.colorApplied] ?? "#94a3b8",
      piecesReturned: values.piecesReturned,
      piecesRejected: values.piecesRejected,
      karigarId: values.karigarId,
      karigarName: karigar?.name ?? "Karigar",
      ratePerPiece: rate,
      amountDue: values.piecesReturned * rate,
    };

    onSave(entry);
    toast.success("Coloring entry saved successfully");
    onClose();
  }

  return (
    <DrawerForm
      open={open}
      onClose={onClose}
      title="Record Coloring Entry"
      description="Add or edit system information"
      footer={
        <div className="flex flex-col gap-2">
          <Button
            type="submit"
            form="coloring-entry-form"
            disabled={isSubmitting}
            className="w-full bg-[#1b3a3a] text-white hover:bg-[#1b3a3a]/90"
          >
            <Save className="size-4" />
            Save Entry
          </Button>
          <Button type="button" variant="ghost" className="w-full" onClick={onClose}>
            Cancel
          </Button>
        </div>
      }
    >
      <form
        id="coloring-entry-form"
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="colorDate">Date</Label>
            <Input id="colorDate" type="date" {...register("entryDate")} />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Linked PO</Label>
            <Select
              value={poId}
              onValueChange={(value) =>
                setValue("poId", value, { shouldValidate: true })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select PO" />
              </SelectTrigger>
              <SelectContent>
                {mockProductionPOs.map((po) => (
                  <SelectItem key={po.id} value={po.id}>
                    {po.poNumber}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="designNo">Design No</Label>
            <Input id="designNo" {...register("designNumber")} />
            {errors.designNumber ? (
              <p className="text-sm text-destructive">
                {errors.designNumber.message}
              </p>
            ) : null}
          </div>
          <div className="flex flex-col gap-2">
            <Label>Bundle No</Label>
            <Select
              value={watch("bundleNumber")}
              onValueChange={(value) =>
                setValue("bundleNumber", value, { shouldValidate: true })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select bundle" />
              </SelectTrigger>
              <SelectContent>
                {printBundles.map((bundle) => (
                  <SelectItem key={bundle.bundleNumber} value={bundle.bundleNumber}>
                    {bundle.bundleNumber}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs italic text-muted-foreground">
              Only bundles that completed Printing are shown.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label>Karigar (Artisan)</Label>
          <Select
            value={watch("karigarId")}
            onValueChange={(value) =>
              setValue("karigarId", value, { shouldValidate: true })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select karigar" />
            </SelectTrigger>
            <SelectContent>
              {mockProductionKarigars.map((party) => (
                <SelectItem key={party.id} value={party.id}>
                  {party.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-lg bg-slate-100 px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Pieces Received for Coloring
          </p>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {piecesReceived.toLocaleString("en-IN")} pcs
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Locked from previous process: Printing
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="colorApplied">Color Applied</Label>
          <Input id="colorApplied" {...register("colorApplied")} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="colorReturned">Returned Pieces</Label>
            <Input
              id="colorReturned"
              type="number"
              {...register("piecesReturned", { valueAsNumber: true })}
            />
            {errors.piecesReturned ? (
              <p className="text-sm text-destructive">
                {errors.piecesReturned.message}
              </p>
            ) : null}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="colorRejected">Rejected Pieces</Label>
            <Input
              id="colorRejected"
              type="number"
              className={cn(piecesRejected > 0 && "border-red-500")}
              {...register("piecesRejected", { valueAsNumber: true })}
            />
          </div>
        </div>

        <KarigarPaymentBox
          variant="gray"
          title="Payment Summary"
          operationName="Coloring"
          rate={rate}
          pieces={piecesReturned}
          amountDue={amountDue}
          piecesLabel="Pieces Returned"
        />

        <div className="flex flex-col gap-2">
          <Label htmlFor="colorNotes">Notes</Label>
          <Textarea id="colorNotes" rows={2} {...register("notes")} />
        </div>

        {designs.length ? null : null}
      </form>
    </DrawerForm>
  );
}
