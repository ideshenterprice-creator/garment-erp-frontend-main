"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Save, User } from "lucide-react";
import { toast } from "sonner";
import {
  getBundlesForStage,
  getOperationRate,
  getOperationsForStage,
  mockProductionKarigars,
  mockProductionPOs,
  type MockStitchingEntry,
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

const stitchingSchema = z
  .object({
    entryDate: z.string().min(1, "Date is required"),
    poId: z.string().min(1, "Linked PO is required"),
    bundleNumber: z.string().min(1, "Bundle No is required"),
    karigarId: z.string().min(1, "Karigar is required"),
    operationId: z.string().min(1, "Operation is required"),
    piecesGiven: z.number().positive("Pieces given must be positive"),
    piecesReturned: z.number().min(0),
    piecesRejected: z.number().min(0),
    notes: z.string().optional(),
  })
  .superRefine((values, ctx) => {
    if (values.piecesReturned + values.piecesRejected > values.piecesGiven) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["piecesReturned"],
        message: "Returned + rejected cannot exceed pieces given",
      });
    }
  });

type StitchingFormValues = z.infer<typeof stitchingSchema>;

interface RecordStitchingDrawerProps {
  open: boolean;
  onClose: () => void;
  onSave: (entry: MockStitchingEntry) => void;
}

export function RecordStitchingDrawer({
  open,
  onClose,
  onSave,
}: RecordStitchingDrawerProps) {
  const stitchOps = useMemo(() => getOperationsForStage("STITCHING"), []);
  const colorBundles = useMemo(() => getBundlesForStage("COLORING"), []);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<StitchingFormValues>({
    resolver: zodResolver(stitchingSchema),
    defaultValues: {
      entryDate: "2023-10-24",
      poId: "",
      bundleNumber: "",
      karigarId: "",
      operationId: "",
      piecesGiven: 420,
      piecesReturned: 418,
      piecesRejected: 2,
      notes: "",
    },
  });

  const karigarId = watch("karigarId");
  const operationId = watch("operationId");
  const piecesReturned = Number(watch("piecesReturned") || 0);
  const piecesRejected = Number(watch("piecesRejected") || 0);
  const rate = getOperationRate(operationId);
  const operationName =
    stitchOps.find((op) => op.id === operationId)?.name ?? "Overlock Stitch";
  const amountDue = piecesReturned * rate;

  useEffect(() => {
    if (!open) return;
    reset({
      entryDate: "2023-10-24",
      poId: mockProductionPOs[0]?.id ?? "",
      bundleNumber: colorBundles[0]?.bundleNumber ?? "",
      karigarId: "k-amit-k",
      operationId: "prod-op-overlock",
      piecesGiven: 420,
      piecesReturned: 418,
      piecesRejected: 2,
      notes: "",
    });
  }, [open, reset, colorBundles]);

  function onSubmit(values: StitchingFormValues) {
    const po = mockProductionPOs.find((item) => item.id === values.poId);
    const karigar = mockProductionKarigars.find(
      (item) => item.id === values.karigarId
    );
    const operation = stitchOps.find((op) => op.id === values.operationId);

    const entry: MockStitchingEntry = {
      id: `st-${Date.now()}`,
      entryNumber: `ST-${String(Date.now()).slice(-4)}`,
      entryDate: values.entryDate,
      poId: values.poId,
      poNumber: po?.poNumber ?? values.poId,
      designNumber: "D-42",
      bundleNumber: values.bundleNumber,
      karigarId: values.karigarId,
      karigarName: karigar?.name ?? "Karigar",
      operationId: values.operationId,
      operationName: operation?.name ?? "Overlock",
      piecesGiven: values.piecesGiven,
      piecesReturned: values.piecesReturned,
      piecesRejected: values.piecesRejected,
      ratePerPiece: operation?.ratePerPiece ?? rate,
      amountDue: values.piecesReturned * (operation?.ratePerPiece ?? rate),
      status: "RETURNED",
    };

    onSave(entry);
    toast.success("Stitching entry saved successfully");
    onClose();
  }

  return (
    <DrawerForm
      open={open}
      onClose={onClose}
      title="Record Stitching Entry"
      description="Update production batch details"
      footer={
        <div className="flex items-center gap-2">
          <Button
            type="submit"
            form="stitching-entry-form"
            disabled={isSubmitting}
            className="bg-[#1b3a3a] text-white hover:bg-[#1b3a3a]/90"
          >
            <Save className="size-4" />
            Save Entry
          </Button>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
        </div>
      }
    >
      <form
        id="stitching-entry-form"
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="stitchDate">Date</Label>
            <Input id="stitchDate" type="date" {...register("entryDate")} />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Linked PO</Label>
            <Select
              value={watch("poId")}
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
                    #{po.poNumber}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
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
              {colorBundles.map((bundle) => (
                <SelectItem key={bundle.bundleNumber} value={bundle.bundleNumber}>
                  {bundle.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs italic text-muted-foreground">
            Only bundles that completed Coloring are shown.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <Label>Karigar</Label>
          <div className="relative">
            <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <Select
              value={karigarId}
              onValueChange={(value) =>
                setValue("karigarId", value, { shouldValidate: true })
              }
            >
              <SelectTrigger className="pl-9">
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
        </div>

        <div className="flex flex-col gap-2">
          <Label>Operation</Label>
          <Select
            value={operationId}
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
              {stitchOps.map((op) => (
                <SelectItem key={op.id} value={op.id}>
                  {op.name}
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

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="flex flex-col gap-2">
            <Label htmlFor="piecesGiven">Given</Label>
            <Input
              id="piecesGiven"
              type="number"
              {...register("piecesGiven", { valueAsNumber: true })}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="stitchReturned">Returned</Label>
            <Input
              id="stitchReturned"
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
            <Label htmlFor="stitchRejected">Rejected</Label>
            <Input
              id="stitchRejected"
              type="number"
              className={cn(piecesRejected > 0 && "border-red-500")}
              {...register("piecesRejected", { valueAsNumber: true })}
            />
          </div>
        </div>

        <KarigarPaymentBox
          variant="gray"
          title="Calculation Summary"
          operationName={operationName}
          rate={rate || 1}
          pieces={piecesReturned}
          amountDue={amountDue}
          piecesLabel="Pieces Returned"
          lockedNote="Note: Rate is locked per the production contract. Adjustments require manager approval."
        />

        <div className="flex flex-col gap-2">
          <Label htmlFor="stitchNotes">Notes</Label>
          <Textarea
            id="stitchNotes"
            rows={3}
            placeholder="Add any observation about quality or machine"
            {...register("notes")}
          />
        </div>
      </form>
    </DrawerForm>
  );
}
