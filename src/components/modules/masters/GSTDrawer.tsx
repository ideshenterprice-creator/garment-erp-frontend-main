"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { CreateGSTPayload, GSTRate } from "@/types";
import { DrawerForm } from "@/components/common/DrawerForm";
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
import { getErrorMessage } from "@/lib/errorHandler";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { createGSTRate, updateGSTRate } from "@/services/masters.service";

const gstSchema = z.object({
  category: z.string().min(1, "Category name is required"),
  gstPercent: z.number().min(0, "GST rate is required"),
  taxType: z.enum(["ZERO_RATED", "IGST", "CGST_SGST"]),
  applicableOn: z.string().min(1, "Applicable on is required"),
  notes: z.string().optional(),
});

type GSTFormValues = z.infer<typeof gstSchema>;

interface GSTDrawerProps {
  open: boolean;
  onClose: () => void;
  rate?: GSTRate | null;
}

const defaultValues: GSTFormValues = {
  category: "",
  gstPercent: 12,
  taxType: "CGST_SGST",
  applicableOn: "In-state Purchase",
  notes: "",
};

export function GSTDrawer({ open, onClose, rate }: GSTDrawerProps) {
  const isEdit = Boolean(rate);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
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
        gstPercent: Number(rate.gstPercent),
        taxType: rate.taxType,
        applicableOn: rate.applicableOn,
        notes: rate.notes ?? "",
      });
    } else {
      reset(defaultValues);
    }
  }, [open, rate, reset]);

  const addGSTMutation = useMutation({
    mutationFn: (data: CreateGSTPayload) => createGSTRate(data),
    onSuccess: () => {
      toast.success("GST rate added.");
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.GST });
      onClose();
      reset(defaultValues);
    },
    onError: (error) => {
      const message = getErrorMessage(error, "Failed to add GST rate.");
      if (
        message.toLowerCase().includes("unique") ||
        message.toLowerCase().includes("already")
      ) {
        toast.error("A GST rate for this category already exists.");
        return;
      }
      toast.error(message);
    },
  });

  const editGSTMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<CreateGSTPayload>;
    }) => updateGSTRate(id, data),
    onSuccess: () => {
      toast.success("GST rate updated.");
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.GST });
      onClose();
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to update GST rate."));
    },
  });

  const isPending = addGSTMutation.isPending || editGSTMutation.isPending;

  function onSubmit(values: GSTFormValues) {
    const payload: CreateGSTPayload = {
      category: values.category,
      gstPercent: values.gstPercent,
      taxType: values.taxType,
      applicableOn: values.applicableOn,
      notes: values.notes || undefined,
    };

    if (isEdit && rate) {
      editGSTMutation.mutate({ id: rate.id, data: payload });
      return;
    }
    addGSTMutation.mutate(payload);
  }

  return (
    <DrawerForm
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit GST Rate" : "Add GST Rate"}
      description="Configure a new tax category for the master list."
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="gst-form"
            disabled={isPending}
            className="bg-[#1b3a3a] text-white hover:bg-[#1b3a3a]/90"
          >
            {isPending ? "Saving..." : isEdit ? "Update Rate" : "Save Rate"}
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
            Notes (Optional)
          </Label>
          <Input id="notes" placeholder="Optional notes" {...register("notes")} />
        </div>
      </form>
    </DrawerForm>
  );
}
