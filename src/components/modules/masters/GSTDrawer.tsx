"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import type { TaxType } from "@/types";
import type { MockGSTRate } from "@/mock/masters";
import { DrawerForm } from "@/components/common/DrawerForm";
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

const gstSchema = z.object({
  category: z.string().min(1, "Category name is required"),
  gstPercent: z.number().min(0, "GST rate is required"),
  taxType: z.enum(["ZERO_RATED", "IGST", "CGST_SGST"]),
  effectiveFrom: z.string().min(1, "Effective from date is required"),
  notes: z.string().optional(),
  applicableOn: z.string().min(1, "Applicable on is required"),
});

type GSTFormValues = z.infer<typeof gstSchema>;

interface GSTDrawerProps {
  open: boolean;
  onClose: () => void;
  rate?: MockGSTRate | null;
  onSave: (rate: MockGSTRate) => void;
}

const defaultValues: GSTFormValues = {
  category: "",
  gstPercent: 12,
  taxType: "CGST_SGST",
  effectiveFrom: "",
  notes: "",
  applicableOn: "In-state Purchase",
};

export function GSTDrawer({ open, onClose, rate, onSave }: GSTDrawerProps) {
  const isEdit = Boolean(rate);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<GSTFormValues>({
    resolver: zodResolver(gstSchema),
    defaultValues,
  });

  const taxType = watch("taxType");

  useEffect(() => {
    if (!open) return;
    if (rate) {
      reset({
        category: rate.category,
        gstPercent: rate.gstPercent,
        taxType: rate.taxType,
        effectiveFrom: rate.effectiveFrom ?? "",
        notes: rate.notes,
        applicableOn: rate.applicableOn,
      });
    } else {
      reset(defaultValues);
    }
  }, [open, rate, reset]);

  function onSubmit(values: GSTFormValues) {
    const next: MockGSTRate = {
      id: rate?.id ?? `gst-${Date.now()}`,
      category: values.category,
      gstPercent: values.gstPercent,
      taxType: values.taxType as TaxType,
      applicableOn: values.applicableOn,
      notes: values.notes ?? "",
      effectiveFrom: values.effectiveFrom,
    };

    onSave(next);
    toast.success(isEdit ? "GST rate updated successfully" : "GST rate saved successfully");
    onClose();
  }

  return (
    <DrawerForm
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit GST Rate" : "Add GST Rate"}
      description="Configure a new tax category for the master list."
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="gst-form"
            disabled={isSubmitting}
            className="bg-[#1b3a3a] text-white hover:bg-[#1b3a3a]/90"
          >
            {isEdit ? "Update Rate" : "Save Rate"}
          </Button>
        </div>
      }
    >
      <form id="gst-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <Label
            htmlFor="category"
            className="text-[11px] font-semibold uppercase tracking-wider text-slate-400"
          >
            Category Name
          </Label>
          <Input
            id="category"
            placeholder="e.g., Embroidered Fabric"
            {...register("category")}
          />
          {errors.category ? (
            <p className="text-sm text-destructive">{errors.category.message}</p>
          ) : null}
        </div>

        <div className="flex flex-col gap-2">
          <Label
            htmlFor="gstPercent"
            className="text-[11px] font-semibold uppercase tracking-wider text-slate-400"
          >
            GST Rate (%)
          </Label>
          <Input
            id="gstPercent"
            type="number"
            {...register("gstPercent", { valueAsNumber: true })}
          />
          {errors.gstPercent ? (
            <p className="text-sm text-destructive">{errors.gstPercent.message}</p>
          ) : null}
        </div>

        <div className="flex flex-col gap-2">
          <Label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Tax Type
          </Label>
          <Select
            value={taxType}
            onValueChange={(value) =>
              setValue("taxType", value as GSTFormValues["taxType"], {
                shouldValidate: true,
              })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ZERO_RATED">Zero Rated</SelectItem>
              <SelectItem value="CGST_SGST">CGST + SGST</SelectItem>
              <SelectItem value="IGST">IGST</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <Label
            htmlFor="effectiveFrom"
            className="text-[11px] font-semibold uppercase tracking-wider text-slate-400"
          >
            Effective From
          </Label>
          <Input id="effectiveFrom" type="date" {...register("effectiveFrom")} />
          {errors.effectiveFrom ? (
            <p className="text-sm text-destructive">
              {errors.effectiveFrom.message}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-2">
          <Label
            htmlFor="applicableOn"
            className="text-[11px] font-semibold uppercase tracking-wider text-slate-400"
          >
            Applicable On
          </Label>
          <Input
            id="applicableOn"
            placeholder="e.g., In-state Purchase"
            {...register("applicableOn")}
          />
          {errors.applicableOn ? (
            <p className="text-sm text-destructive">
              {errors.applicableOn.message}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-2">
          <Label
            htmlFor="notes"
            className="text-[11px] font-semibold uppercase tracking-wider text-slate-400"
          >
            Remarks
          </Label>
          <Textarea
            id="notes"
            rows={4}
            placeholder="Brief explanation of the tax applicability..."
            {...register("notes")}
          />
        </div>
      </form>
    </DrawerForm>
  );
}
