"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  emptySizeBreakdown,
  getRateForStage,
  mockProductionKarigars,
  mockProductionPOs,
  sumSizeBreakdown,
  type MockCuttingEntry,
  type SizeBreakdown,
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

const sizeKeys = [
  "qty_0_3M",
  "qty_3_6M",
  "qty_6_9M",
  "qty_9_12M",
  "qty_12_18M",
  "qty_18_24M",
] as const;

const sizeLabels: Record<(typeof sizeKeys)[number], string> = {
  qty_0_3M: "0-3M",
  qty_3_6M: "3-6M",
  qty_6_9M: "6-9M",
  qty_9_12M: "9-12M",
  qty_12_18M: "12-18M",
  qty_18_24M: "18-24M",
};

const cuttingSchema = z
  .object({
    entryDate: z.string().min(1, "Date is required"),
    poId: z.string().min(1, "Linked PO is required"),
    designNumber: z.string().min(1, "Design No is required"),
    karigarId: z.string().min(1, "Karigar is required"),
    wastageKg: z.number().min(0, "Wastage must be 0 or more"),
    qty_0_3M: z.number().min(0),
    qty_3_6M: z.number().min(0),
    qty_6_9M: z.number().min(0),
    qty_9_12M: z.number().min(0),
    qty_12_18M: z.number().min(0),
    qty_18_24M: z.number().min(0),
    notes: z.string().optional(),
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
  onSave: (entry: MockCuttingEntry) => void;
}

export function RecordCuttingDrawer({
  open,
  onClose,
  onSave,
}: RecordCuttingDrawerProps) {
  const rate = getRateForStage("CUTTING");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CuttingFormValues>({
    resolver: zodResolver(cuttingSchema),
    defaultValues: {
      entryDate: "2024-10-24",
      poId: "",
      designNumber: "",
      karigarId: "",
      wastageKg: 1.25,
      ...emptySizeBreakdown(),
      qty_0_3M: 160,
      qty_3_6M: 180,
      qty_6_9M: 200,
      qty_9_12M: 150,
      qty_12_18M: 140,
      qty_18_24M: 140,
      notes: "",
    },
  });

  const poId = watch("poId");
  const sizes: SizeBreakdown = {
    qty_0_3M: Number(watch("qty_0_3M") || 0),
    qty_3_6M: Number(watch("qty_3_6M") || 0),
    qty_6_9M: Number(watch("qty_6_9M") || 0),
    qty_9_12M: Number(watch("qty_9_12M") || 0),
    qty_12_18M: Number(watch("qty_12_18M") || 0),
    qty_18_24M: Number(watch("qty_18_24M") || 0),
  };
  const totalPieces = sumSizeBreakdown(sizes);
  const amountDue = totalPieces * rate;

  const designs = useMemo(() => {
    return mockProductionPOs.find((po) => po.id === poId)?.designs ?? [];
  }, [poId]);

  const selectedPo = mockProductionPOs.find((po) => po.id === poId);
  const selectedDesign = designs.find(
    (design) => design.designNumber === watch("designNumber")
  );

  useEffect(() => {
    if (!open) return;
    reset({
      entryDate: "2024-10-24",
      poId: mockProductionPOs[0]?.id ?? "",
      designNumber: mockProductionPOs[0]?.designs[0]?.designNumber ?? "",
      karigarId: "k-amit",
      wastageKg: 1.25,
      qty_0_3M: 160,
      qty_3_6M: 180,
      qty_6_9M: 200,
      qty_9_12M: 150,
      qty_12_18M: 140,
      qty_18_24M: 140,
      notes: "",
    });
  }, [open, reset]);

  useEffect(() => {
    if (designs.length === 0) {
      setValue("designNumber", "");
      return;
    }
    const current = watch("designNumber");
    if (!designs.some((design) => design.designNumber === current)) {
      setValue("designNumber", designs[0].designNumber);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [designs, setValue]);

  function onSubmit(values: CuttingFormValues) {
    const po = mockProductionPOs.find((item) => item.id === values.poId);
    const design = po?.designs.find(
      (item) => item.designNumber === values.designNumber
    );
    const karigar = mockProductionKarigars.find(
      (item) => item.id === values.karigarId
    );
    const nextSizes: SizeBreakdown = {
      qty_0_3M: values.qty_0_3M,
      qty_3_6M: values.qty_3_6M,
      qty_6_9M: values.qty_6_9M,
      qty_9_12M: values.qty_9_12M,
      qty_12_18M: values.qty_12_18M,
      qty_18_24M: values.qty_18_24M,
    };
    const pieces = sumSizeBreakdown(nextSizes);

    const entry: MockCuttingEntry = {
      id: `ce-${Date.now()}`,
      entryNumber: `CE-${String(Date.now()).slice(-4)}`,
      entryDate: values.entryDate,
      poId: values.poId,
      poNumber: po?.poNumber ?? values.poId,
      designNumber: values.designNumber,
      designLabel: design?.garmentType ?? values.designNumber,
      bundleNumber: `BND-${String(Date.now()).slice(-3)}`,
      fabricKg: 45.5,
      pieces,
      sizes: nextSizes,
      wastageKg: values.wastageKg,
      karigarId: values.karigarId,
      karigarName: karigar?.name ?? "Karigar",
      ratePerPiece: rate,
      amountDue: pieces * rate,
    };

    onSave(entry);
    toast.success("Cutting entry saved successfully");
    onClose();
  }

  return (
    <DrawerForm
      open={open}
      onClose={onClose}
      title="Record Cutting Entry"
      description="Fill details for batch processing"
      className="sm:max-w-lg"
      footer={
        <div className="flex flex-col gap-2">
          <Button
            type="submit"
            form="cutting-entry-form"
            disabled={isSubmitting}
            className="w-full bg-[#1b3a3a] text-white hover:bg-[#1b3a3a]/90"
          >
            Save Entry
          </Button>
          <Button type="button" variant="ghost" className="w-full" onClick={onClose}>
            Cancel
          </Button>
        </div>
      }
    >
      <form
        id="cutting-entry-form"
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="entryDate">Date</Label>
            <Input id="entryDate" type="date" {...register("entryDate")} />
            {errors.entryDate ? (
              <p className="text-sm text-destructive">{errors.entryDate.message}</p>
            ) : null}
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
            {errors.poId ? (
              <p className="text-sm text-destructive">{errors.poId.message}</p>
            ) : null}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label>Design No</Label>
            <Select
              value={watch("designNumber")}
              onValueChange={(value) =>
                setValue("designNumber", value, { shouldValidate: true })
              }
              disabled={designs.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select design" />
              </SelectTrigger>
              <SelectContent>
                {designs.map((design) => (
                  <SelectItem key={design.id} value={design.designNumber}>
                    {design.designNumber} ({design.garmentType})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.designNumber ? (
              <p className="text-sm text-destructive">
                {errors.designNumber.message}
              </p>
            ) : null}
          </div>
          <div className="flex flex-col gap-2">
            <Label>Bundle No</Label>
            <Input
              value={`BND-${selectedPo?.poNumber.slice(-3) ?? "048"}`}
              readOnly
              className="bg-slate-50"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label>Karigar</Label>
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
            {errors.karigarId ? (
              <p className="text-sm text-destructive">
                {errors.karigarId.message}
              </p>
            ) : null}
          </div>
          <div className="flex flex-col gap-2">
            <Label>Fabric Issued (kg)</Label>
            <Input value="45.50" readOnly className="bg-slate-50" />
          </div>
        </div>

        <div>
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Pieces Cut by Size
          </p>
          <div className="grid grid-cols-3 gap-3">
            {sizeKeys.map((key) => (
              <div key={key} className="flex flex-col gap-1.5">
                <Label className="text-xs text-slate-500">{sizeLabels[key]}</Label>
                <Input
                  type="number"
                  min={0}
                  {...register(key, { valueAsNumber: true })}
                />
              </div>
            ))}
          </div>
          {errors.qty_0_3M ? (
            <p className="mt-2 text-sm text-destructive">
              {errors.qty_0_3M.message}
            </p>
          ) : null}
          <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-3 text-sm">
            <span className="text-slate-500">Total Pieces</span>
            <span className="font-bold text-slate-900">
              {totalPieces.toLocaleString("en-IN")}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="wastageKg">Wastage (kg)</Label>
          <Input
            id="wastageKg"
            type="number"
            step="0.01"
            {...register("wastageKg", { valueAsNumber: true })}
          />
          {errors.wastageKg ? (
            <p className="text-sm text-destructive">{errors.wastageKg.message}</p>
          ) : null}
        </div>

        <KarigarPaymentBox
          variant="peach"
          operationName="Fabric Cutting"
          rate={rate}
          pieces={totalPieces}
          amountDue={amountDue}
          title="Payment Calculation"
        />

        <div className="flex flex-col gap-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            rows={2}
            placeholder="Optional notes..."
            {...register("notes")}
          />
        </div>

        {selectedDesign ? (
          <p className="sr-only">{selectedDesign.garmentType}</p>
        ) : null}
      </form>
    </DrawerForm>
  );
}
