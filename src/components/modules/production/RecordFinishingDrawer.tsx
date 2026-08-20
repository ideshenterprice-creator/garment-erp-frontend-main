"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Info } from "lucide-react";
import { toast } from "sonner";
import {
  getBundlesForStage,
  getOperationRate,
  getOperationsForStage,
  mockProductionKarigars,
  mockProductionPOs,
  mockStitchingEntries,
  type MockFinishingEntry,
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

const finishingSchema = z
  .object({
    entryDate: z.string().min(1, "Date is required"),
    poId: z.string().min(1, "Linked PO is required"),
    designNumber: z.string().min(1, "Design No is required"),
    bundleNumber: z.string().min(1, "Bundle No is required"),
    karigarId: z.string().min(1, "Karigar is required"),
    operationId: z.string().min(1, "Operation is required"),
    piecesReceived: z.number().positive(),
    piecesCompleted: z.number().min(0),
    notes: z.string().optional(),
  })
  .superRefine((values, ctx) => {
    if (values.piecesCompleted > values.piecesReceived) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["piecesCompleted"],
        message: "Completed pieces cannot exceed pieces received",
      });
    }
  });

type FinishingFormValues = z.infer<typeof finishingSchema>;

interface RecordFinishingDrawerProps {
  open: boolean;
  onClose: () => void;
  onSave: (entry: MockFinishingEntry) => void;
}

export function RecordFinishingDrawer({
  open,
  onClose,
  onSave,
}: RecordFinishingDrawerProps) {
  const finishOps = useMemo(() => getOperationsForStage("FINISHING"), []);
  const stitchBundles = useMemo(() => getBundlesForStage("STITCHING"), []);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FinishingFormValues>({
    resolver: zodResolver(finishingSchema),
    defaultValues: {
      entryDate: "2023-11-24",
      poId: "",
      designNumber: "",
      bundleNumber: "",
      karigarId: "",
      operationId: "prod-op-iron",
      piecesReceived: 974,
      piecesCompleted: 974,
      notes: "",
    },
  });

  const operationId = watch("operationId");
  const piecesCompleted = Number(watch("piecesCompleted") || 0);
  const piecesReceived = Number(watch("piecesReceived") || 0);
  const rate = getOperationRate(operationId);
  const operationName =
    finishOps.find((op) => op.id === operationId)?.name ?? "Ironing";
  const amountDue = piecesCompleted * rate;
  const poId = watch("poId");

  const designs = useMemo(() => {
    return mockProductionPOs.find((po) => po.id === poId)?.designs ?? [];
  }, [poId]);

  useEffect(() => {
    if (!open) return;
    const first = stitchBundles[0];
    const stitching = mockStitchingEntries.find(
      (entry) => entry.bundleNumber === first?.bundleNumber
    );
    reset({
      entryDate: "2023-11-24",
      poId: stitching?.poId ?? mockProductionPOs[0]?.id ?? "",
      designNumber: stitching?.designNumber ?? "DN-992-BLK",
      bundleNumber: first?.bundleNumber ?? "",
      karigarId: "k-mohammad",
      operationId: "prod-op-iron",
      piecesReceived: first?.pieces ?? 974,
      piecesCompleted: first?.pieces ?? 974,
      notes: "",
    });
  }, [open, reset, stitchBundles]);

  function onSubmit(values: FinishingFormValues) {
    const po = mockProductionPOs.find((item) => item.id === values.poId);
    const karigar = mockProductionKarigars.find(
      (item) => item.id === values.karigarId
    );
    const operation = finishOps.find((op) => op.id === values.operationId);

    const entry: MockFinishingEntry = {
      id: `fn-${Date.now()}`,
      entryNumber: `FN-${String(Date.now()).slice(-3)}`,
      entryDate: values.entryDate,
      poId: values.poId,
      poNumber: po?.poNumber ?? values.poId,
      designNumber: values.designNumber,
      bundleNumber: values.bundleNumber,
      piecesReceived: values.piecesReceived,
      operationId: values.operationId,
      operationName: operation?.name ?? "Ironing",
      piecesCompleted: values.piecesCompleted,
      karigarId: values.karigarId,
      karigarName: karigar?.name ?? "Karigar",
      ratePerPiece: operation?.ratePerPiece ?? rate,
      amountDue: values.piecesCompleted * (operation?.ratePerPiece ?? rate),
    };

    onSave(entry);
    toast.success("Finishing entry saved successfully");
    onClose();
  }

  return (
    <DrawerForm
      open={open}
      onClose={onClose}
      title="Record Finishing Entry"
      description="Add or edit system information"
      footer={
        <div className="flex items-center justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="finishing-entry-form"
            disabled={isSubmitting}
            className="bg-[#1b3a3a] text-white hover:bg-[#1b3a3a]/90"
          >
            Save Entry
          </Button>
        </div>
      }
    >
      <form
        id="finishing-entry-form"
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="finishDate">Date</Label>
            <Input id="finishDate" type="date" {...register("entryDate")} />
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
            <Label>Design No</Label>
            <Select
              value={watch("designNumber")}
              onValueChange={(value) =>
                setValue("designNumber", value, { shouldValidate: true })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select design" />
              </SelectTrigger>
              <SelectContent>
                {(designs.length
                  ? designs
                  : [{ id: "d1", designNumber: watch("designNumber") || "D-42" }]
                ).map((design) => (
                  <SelectItem key={design.id} value={design.designNumber}>
                    {design.designNumber}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label>Bundle No</Label>
            <Select
              value={watch("bundleNumber")}
              onValueChange={(value) => {
                setValue("bundleNumber", value, { shouldValidate: true });
                const stitching = mockStitchingEntries.find(
                  (entry) => entry.bundleNumber === value
                );
                if (stitching) {
                  setValue("piecesReceived", stitching.piecesReturned);
                  setValue("piecesCompleted", stitching.piecesReturned);
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select bundle" />
              </SelectTrigger>
              <SelectContent>
                {stitchBundles.map((bundle) => (
                  <SelectItem key={bundle.bundleNumber} value={bundle.bundleNumber}>
                    {bundle.bundleNumber}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs italic text-muted-foreground">
              Only bundles that completed Stitching are shown.
            </p>
          </div>
        </div>

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
        </div>

        <div className="flex flex-col gap-2">
          <Label>Operation</Label>
          <Select
            value={operationId}
            onValueChange={(value) =>
              setValue("operationId", value, { shouldValidate: true })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select operation" />
            </SelectTrigger>
            <SelectContent>
              {finishOps.map((op) => (
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

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label>Pieces Received</Label>
            <div className="relative">
              <Input
                type="number"
                className="pr-12"
                {...register("piecesReceived", { valueAsNumber: true })}
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                pcs
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="piecesCompleted">Pieces Completed</Label>
            <Input
              id="piecesCompleted"
              type="number"
              {...register("piecesCompleted", { valueAsNumber: true })}
            />
            {errors.piecesCompleted ? (
              <p className="text-sm text-destructive">
                {errors.piecesCompleted.message}
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex items-start gap-2 rounded-lg border border-sky-100 bg-sky-50 px-3 py-3 text-sm text-sky-800">
          <Info className="mt-0.5 size-4 shrink-0" />
          <p>
            After all Finishing operations are recorded for this bundle, it will
            be marked as Ready for Boxing.
          </p>
        </div>

        <KarigarPaymentBox
          variant="teal"
          title="Payment Summary"
          operationName={operationName}
          rate={rate || 0.3}
          pieces={piecesCompleted}
          amountDue={amountDue}
          piecesLabel="Pieces Completed"
        />

        <div className="flex flex-col gap-2">
          <Label htmlFor="finishNotes">Notes</Label>
          <Textarea id="finishNotes" rows={2} {...register("notes")} />
        </div>

        <p className="sr-only">{piecesReceived}</p>
      </form>
    </DrawerForm>
  );
}
