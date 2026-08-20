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
  mockCuttingEntries,
  mockProductionKarigars,
  mockProductionPOs,
  type MockPrintingEntry,
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

const printingSchema = z
  .object({
    entryDate: z.string().min(1, "Date is required"),
    poId: z.string().min(1, "Linked PO is required"),
    designNumber: z.string().min(1, "Design No is required"),
    bundleNumber: z.string().min(1, "Bundle No is required"),
    karigarId: z.string().min(1, "Karigar is required"),
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

type PrintingFormValues = z.infer<typeof printingSchema>;

interface RecordPrintingDrawerProps {
  open: boolean;
  onClose: () => void;
  onSave: (entry: MockPrintingEntry) => void;
}

export function RecordPrintingDrawer({
  open,
  onClose,
  onSave,
}: RecordPrintingDrawerProps) {
  const rate = getRateForStage("PRINTING");
  const cuttingBundles = useMemo(() => getBundlesForStage("CUTTING"), []);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PrintingFormValues>({
    resolver: zodResolver(printingSchema),
    defaultValues: {
      entryDate: "2024-02-21",
      poId: "",
      designNumber: "",
      bundleNumber: "",
      karigarId: "",
      piecesReceived: 970,
      piecesReturned: 965,
      piecesRejected: 5,
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
    const firstBundle = cuttingBundles[0];
    const cutting = mockCuttingEntries.find(
      (entry) => entry.bundleNumber === firstBundle?.bundleNumber
    );
    reset({
      entryDate: "2024-02-21",
      poId: cutting?.poId ?? mockProductionPOs[0]?.id ?? "",
      designNumber: cutting?.designNumber ?? "",
      bundleNumber: firstBundle?.bundleNumber ?? "",
      karigarId: "k-vinod",
      piecesReceived: firstBundle?.pieces ?? 970,
      piecesReturned: Math.max(0, (firstBundle?.pieces ?? 970) - 5),
      piecesRejected: 5,
      notes: "",
    });
  }, [open, reset, cuttingBundles]);

  useEffect(() => {
    const bundle = watch("bundleNumber");
    const cutting = mockCuttingEntries.find(
      (entry) => entry.bundleNumber === bundle
    );
    if (cutting) {
      setValue("piecesReceived", cutting.pieces);
      setValue("poId", cutting.poId);
      setValue("designNumber", cutting.designNumber);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watch("bundleNumber"), setValue]);

  function onSubmit(values: PrintingFormValues) {
    const po = mockProductionPOs.find((item) => item.id === values.poId);
    const karigar = mockProductionKarigars.find(
      (item) => item.id === values.karigarId
    );

    const entry: MockPrintingEntry = {
      id: `pr-${Date.now()}`,
      entryNumber: `PR-${String(Date.now()).slice(-3)}`,
      entryDate: values.entryDate,
      poId: values.poId,
      poNumber: po?.poNumber ?? values.poId,
      designNumber: values.designNumber,
      bundleNumber: values.bundleNumber,
      piecesReceived: values.piecesReceived,
      piecesReturned: values.piecesReturned,
      piecesRejected: values.piecesRejected,
      karigarId: values.karigarId,
      karigarName: karigar?.name ?? "Karigar",
      ratePerPiece: rate,
      amountDue: values.piecesReturned * rate,
    };

    onSave(entry);
    toast.success("Printing entry saved successfully");
    onClose();
  }

  return (
    <DrawerForm
      open={open}
      onClose={onClose}
      title="Record Printing Entry"
      description="Add or edit system information"
      footer={
        <div className="flex flex-col gap-2">
          <Button
            type="submit"
            form="printing-entry-form"
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
        id="printing-entry-form"
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
      >
        <div className="flex flex-col gap-2">
          <Label htmlFor="printDate">Date</Label>
          <Input id="printDate" type="date" {...register("entryDate")} />
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
                  {po.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

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
              {designs.map((design) => (
                <SelectItem key={design.id} value={design.designNumber}>
                  {design.designNumber} ({design.garmentType})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
              {cuttingBundles.map((bundle) => (
                <SelectItem key={bundle.bundleNumber} value={bundle.bundleNumber}>
                  {bundle.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs italic text-muted-foreground">
            Only bundles that completed Cutting are shown.
          </p>
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
          <Label>Pieces Received for Printing</Label>
          <Input
            value={`${piecesReceived} pcs`}
            readOnly
            className="bg-slate-50"
          />
          <p className="text-xs italic text-muted-foreground">
            Auto-filled from Cutting record.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="piecesReturned">Pieces Returned after Printing</Label>
          <Input
            id="piecesReturned"
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
          <Label htmlFor="piecesRejected">Pieces Rejected</Label>
          <Input
            id="piecesRejected"
            type="number"
            {...register("piecesRejected", { valueAsNumber: true })}
          />
          <p className="text-xs italic text-red-600">
            Rejected pieces will be recorded as production loss.
          </p>
          <p className="sr-only">{piecesRejected}</p>
        </div>

        <KarigarPaymentBox
          variant="teal"
          title="Payment Summary"
          operationName="Screen Printing"
          rate={rate}
          pieces={piecesReturned}
          amountDue={amountDue}
          piecesLabel="Pieces Returned"
        />

        <div className="flex flex-col gap-2">
          <Label htmlFor="printNotes">Notes</Label>
          <Textarea id="printNotes" rows={2} {...register("notes")} />
        </div>
      </form>
    </DrawerForm>
  );
}
