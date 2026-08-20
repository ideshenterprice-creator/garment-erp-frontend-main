"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import type { OperationStage } from "@/types";
import type { MockOperation } from "@/mock/masters";
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

const operationSchema = z.object({
  name: z.string().min(1, "Operation name is required"),
  stage: z.enum(["CUTTING", "PRINTING", "COLORING", "STITCHING", "FINISHING"]),
  ratePerPiece: z.number().min(0, "Rate is required"),
  unit: z.string().min(1, "Unit is required"),
});

type OperationFormValues = z.infer<typeof operationSchema>;

interface OperationsDrawerProps {
  open: boolean;
  onClose: () => void;
  operation?: MockOperation | null;
  onSave: (operation: MockOperation) => void;
}

const defaultValues: OperationFormValues = {
  name: "",
  stage: "CUTTING",
  ratePerPiece: 0,
  unit: "PCS",
};

export function OperationsDrawer({
  open,
  onClose,
  operation,
  onSave,
}: OperationsDrawerProps) {
  const isEdit = Boolean(operation);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<OperationFormValues>({
    resolver: zodResolver(operationSchema),
    defaultValues,
  });

  const stage = watch("stage");

  useEffect(() => {
    if (!open) return;
    if (operation) {
      reset({
        name: operation.name,
        stage: operation.stage,
        ratePerPiece: operation.ratePerPiece,
        unit: operation.unit,
      });
    } else {
      reset(defaultValues);
    }
  }, [open, operation, reset]);

  function onSubmit(values: OperationFormValues) {
    const next: MockOperation = {
      id: operation?.id ?? `op-${Date.now()}`,
      operationCode:
        operation?.operationCode ?? `OP-${Date.now().toString().slice(-4)}`,
      name: values.name,
      stage: values.stage as OperationStage,
      ratePerPiece: values.ratePerPiece,
      unit: values.unit,
      isActive: operation?.isActive ?? true,
      lastUpdated: new Date().toISOString(),
    };

    onSave(next);
    toast.success(
      isEdit ? "Operation updated successfully" : "Operation saved successfully"
    );
    onClose();
  }

  return (
    <DrawerForm
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Operation" : "Add Operation"}
      description="Define production stage and piece rate."
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="operation-form"
            disabled={isSubmitting}
            className="bg-[#1b3a3a] text-white hover:bg-[#1b3a3a]/90"
          >
            {isEdit ? "Update Operation" : "Save Operation"}
          </Button>
        </div>
      }
    >
      <form
        id="operation-form"
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-5"
      >
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          <div className="flex gap-2">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600" />
            <p>
              Rates defined here are final. Karigar payments are auto-calculated
              based on these entries. No manual override allowed at the billing
              stage.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="operation-name">
            Operation Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="operation-name"
            placeholder="e.g. Pattern Cutting"
            {...register("name")}
          />
          {errors.name ? (
            <p className="text-sm text-destructive">{errors.name.message}</p>
          ) : null}
        </div>

        <div className="flex flex-col gap-2">
          <Label>
            Production Stage <span className="text-red-500">*</span>
          </Label>
          <Select
            value={stage}
            onValueChange={(value) =>
              setValue("stage", value as OperationFormValues["stage"], {
                shouldValidate: true,
              })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CUTTING">Cutting</SelectItem>
              <SelectItem value="PRINTING">Printing</SelectItem>
              <SelectItem value="COLORING">Coloring</SelectItem>
              <SelectItem value="STITCHING">Stitching</SelectItem>
              <SelectItem value="FINISHING">Finishing</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-2">
            <Label htmlFor="ratePerPiece">
              Rate (₹ / Pc) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="ratePerPiece"
              type="number"
              step="0.01"
              {...register("ratePerPiece", { valueAsNumber: true })}
            />
            {errors.ratePerPiece ? (
              <p className="text-sm text-destructive">
                {errors.ratePerPiece.message}
              </p>
            ) : null}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="unit">Unit</Label>
            <Input id="unit" {...register("unit")} />
          </div>
        </div>
      </form>
    </DrawerForm>
  );
}
