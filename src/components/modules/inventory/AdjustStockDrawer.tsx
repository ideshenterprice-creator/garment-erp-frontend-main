"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { MinusCircle, PlusCircle } from "lucide-react";
import { toast } from "sonner";
import {
  ADJUSTMENT_REASONS,
  getUnitLabel,
  type MockStockItem,
} from "@/mock/inventory";
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
import { cn } from "@/lib/utils";

const adjustSchema = z.object({
  adjustmentType: z.enum(["ADD", "REDUCE"]),
  quantity: z.number().positive("Quantity must be greater than 0"),
  reason: z.string().min(1, "Reason is required"),
  notes: z.string().optional(),
  adjustmentDate: z.string().min(1, "Adjustment date is required"),
});

type AdjustFormValues = z.infer<typeof adjustSchema>;

interface AdjustStockDrawerProps {
  open: boolean;
  item: MockStockItem | null;
  onClose: () => void;
  onSave: (itemId: string, nextQuantity: number) => void;
}

export function AdjustStockDrawer({
  open,
  item,
  onClose,
  onSave,
}: AdjustStockDrawerProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<AdjustFormValues>({
    resolver: zodResolver(adjustSchema),
    defaultValues: {
      adjustmentType: "ADD",
      quantity: 50,
      reason: "Physical Count Correction",
      notes: "",
      adjustmentDate: "2024-05-25",
    },
  });

  const adjustmentType = watch("adjustmentType");
  const quantity = Number(watch("quantity") || 0);
  const unit = item ? getUnitLabel(item.product.unit) : "kg";
  const currentQty = item?.quantity ?? 0;

  const previewResult =
    adjustmentType === "ADD" ? currentQty + quantity : currentQty - quantity;
  const exceedsStock = adjustmentType === "REDUCE" && quantity > currentQty;

  useEffect(() => {
    if (!open || !item) return;
    reset({
      adjustmentType: "ADD",
      quantity: 50,
      reason: "Physical Count Correction",
      notes: "",
      adjustmentDate: "2024-05-25",
    });
  }, [open, item, reset]);

  const previewText = useMemo(() => {
    if (!item || !Number.isFinite(quantity) || quantity <= 0) {
      return `${currentQty.toLocaleString("en-IN")} ${unit}`;
    }
    const op = adjustmentType === "ADD" ? "+" : "−";
    return `${currentQty.toLocaleString("en-IN")} ${op} ${quantity.toLocaleString("en-IN")} = ${previewResult.toLocaleString("en-IN")} ${unit}`;
  }, [adjustmentType, currentQty, item, previewResult, quantity, unit]);

  function onSubmit(values: AdjustFormValues) {
    if (!item) return;
    if (values.adjustmentType === "REDUCE" && values.quantity > item.quantity) {
      return;
    }
    const next =
      values.adjustmentType === "ADD"
        ? item.quantity + values.quantity
        : item.quantity - values.quantity;
    onSave(item.id, next);
    toast.success("Stock adjusted successfully");
    onClose();
  }

  return (
    <DrawerForm
      open={open}
      onClose={onClose}
      title="Adjust Stock"
      description={item?.product.name}
      footer={
        <div className="flex flex-col gap-2">
          <Button
            type="submit"
            form="adjust-stock-form"
            disabled={isSubmitting || exceedsStock || !item}
            className="w-full bg-[#1b3a3a] text-white hover:bg-[#1b3a3a]/90"
          >
            Save Adjustment
          </Button>
          <Button type="button" variant="ghost" className="w-full" onClick={onClose}>
            Cancel
          </Button>
        </div>
      }
    >
      {item ? (
        <form
          id="adjust-stock-form"
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-5"
        >
          <div className="rounded-xl bg-slate-100 px-4 py-5 text-center">
            <p className="text-3xl font-bold text-slate-900">
              {currentQty.toLocaleString("en-IN")} {unit}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Current Available Stock
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Adjustment Type
            </Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() =>
                  setValue("adjustmentType", "ADD", { shouldValidate: true })
                }
                className={cn(
                  "flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors",
                  adjustmentType === "ADD"
                    ? "border-slate-900 bg-white text-slate-900"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                )}
              >
                <PlusCircle className="size-4" />
                Add Stock
              </button>
              <button
                type="button"
                onClick={() =>
                  setValue("adjustmentType", "REDUCE", { shouldValidate: true })
                }
                className={cn(
                  "flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors",
                  adjustmentType === "REDUCE"
                    ? "border-slate-900 bg-white text-slate-900"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                )}
              >
                <MinusCircle className="size-4" />
                Reduce Stock
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="quantity">
              Quantity ({unit.toUpperCase()})
            </Label>
            <div className="relative">
              <Input
                id="quantity"
                type="number"
                step="any"
                className="pr-12"
                {...register("quantity", { valueAsNumber: true })}
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                {unit}
              </span>
            </div>
            {errors.quantity ? (
              <p className="text-sm text-destructive">{errors.quantity.message}</p>
            ) : null}
            {exceedsStock ? (
              <p className="text-sm text-destructive">
                Cannot reduce more than available stock (
                {currentQty.toLocaleString("en-IN")} {unit}).
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-2">
            <Label>Reason</Label>
            <Select
              value={watch("reason")}
              onValueChange={(value) =>
                setValue("reason", value, { shouldValidate: true })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select reason" />
              </SelectTrigger>
              <SelectContent>
                {ADJUSTMENT_REASONS.map((reason) => (
                  <SelectItem key={reason} value={reason}>
                    {reason}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.reason ? (
              <p className="text-sm text-destructive">{errors.reason.message}</p>
            ) : null}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Additional details about this adjustment..."
              rows={3}
              {...register("notes")}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="adjustmentDate">Adjustment Date</Label>
            <Input
              id="adjustmentDate"
              type="date"
              {...register("adjustmentDate")}
            />
            {errors.adjustmentDate ? (
              <p className="text-sm text-destructive">
                {errors.adjustmentDate.message}
              </p>
            ) : null}
          </div>

          <div className="flex items-center justify-between rounded-lg bg-slate-100 px-3 py-2.5 text-sm">
            <span className="text-slate-500">Calculation Preview</span>
            <span className="font-medium text-slate-800">{previewText}</span>
          </div>
        </form>
      ) : null}
    </DrawerForm>
  );
}
