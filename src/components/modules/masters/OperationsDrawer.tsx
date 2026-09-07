"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import type { CreateOperationPayload, Operation, OperationDepartment } from "@/types";
import {
  DEPARTMENT_LABELS,
  OPERATION_DEPARTMENTS,
  STAGE_DEPARTMENTS,
} from "@/types";
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
import { createOperation, updateOperation } from "@/services/masters.service";

const departmentTypeEnum = z.enum(OPERATION_DEPARTMENTS as [OperationDepartment, ...OperationDepartment[]]);

const operationSchema = z.object({
  name: z.string().min(1, "Operation name is required"),
  stage: z.enum(["CUTTING", "PRINTING", "COLORING", "STITCHING", "FINISHING"]),
  lotNo: z.string().optional(),
  department: z.string().optional(),
  departmentType: departmentTypeEnum.optional(),
  ratePerPiece: z.number().min(0, "Rate is required"),
  unit: z.string().min(1, "Unit is required"),
});

type OperationFormValues = z.infer<typeof operationSchema>;

interface OperationsDrawerProps {
  open: boolean;
  onClose: () => void;
  operation?: Operation | null;
}

const defaultValues: OperationFormValues = {
  name: "",
  stage: "CUTTING",
  lotNo: "",
  department: "",
  departmentType: undefined,
  ratePerPiece: 0,
  unit: "PCS",
};

export function OperationsDrawer({
  open,
  onClose,
  operation,
}: OperationsDrawerProps) {
  const isEdit = Boolean(operation);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    setError,
    watch,
    formState: { errors },
  } = useForm<OperationFormValues>({
    resolver: zodResolver(operationSchema),
    defaultValues,
  });

  const stage = watch("stage");
  const departmentType = watch("departmentType");
  const departmentOptions = STAGE_DEPARTMENTS[stage] ?? ["OTHER"];

  useEffect(() => {
    if (!open) return;
    if (operation) {
      reset({
        name: operation.name,
        stage: operation.stage,
        lotNo: operation.lotNo ?? "",
        department: operation.department ?? "",
        departmentType: operation.departmentType ?? undefined,
        ratePerPiece: Number(operation.ratePerPiece),
        unit: operation.unit || "PCS",
      });
    } else {
      reset(defaultValues);
    }
  }, [open, operation, reset]);

  function handleSaveError(error: unknown, fallback: string) {
    const message = getErrorMessage(error, fallback);
    const lower = message.toLowerCase();
    if (lower.includes("lot no") || lower.includes("duplicate_lot_no")) {
      setError("lotNo", {
        type: "server",
        message: "This Lot No already exists.",
      });
      toast.error("This Lot No already exists.");
      return;
    }
    if (lower.includes("already exists") || lower.includes("unique")) {
      toast.error("An operation with this name already exists.");
      return;
    }
    toast.error(message);
  }

  const addOperationMutation = useMutation({
    mutationFn: (data: CreateOperationPayload) => createOperation(data),
    onSuccess: () => {
      toast.success("Operation added.");
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.OPERATIONS });
      onClose();
      reset(defaultValues);
    },
    onError: (error) => handleSaveError(error, "Failed to add operation."),
  });

  const editOperationMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<CreateOperationPayload>;
    }) => updateOperation(id, data),
    onSuccess: (response) => {
      toast.success(
        response.data.note ??
          response.message ??
          "Operation updated."
      );
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.OPERATIONS });
      onClose();
    },
    onError: (error) => handleSaveError(error, "Failed to update operation."),
  });

  const isPending =
    addOperationMutation.isPending || editOperationMutation.isPending;

  function buildPayload(values: OperationFormValues): CreateOperationPayload {
    return {
      name: values.name,
      stage: values.stage,
      ratePerPiece: values.ratePerPiece,
      unit: values.unit,
      lotNo: values.lotNo?.trim() || null,
      department: values.department?.trim() || null,
      departmentType: values.departmentType || null,
    };
  }

  function onSubmit(values: OperationFormValues) {
    const payload = buildPayload(values);

    if (isEdit && operation) {
      editOperationMutation.mutate({ id: operation.id, data: payload });
      return;
    }
    addOperationMutation.mutate(payload);
  }

  return (
    <DrawerForm
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Operation" : "Add Operation"}
      description="Define production stage and piece rate."
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="operation-form"
            disabled={isPending}
            className="bg-[#1b3a3a] text-white hover:bg-[#1b3a3a]/90"
          >
            {isPending
              ? "Saving..."
              : isEdit
                ? "Update Operation"
                : "Save Operation"}
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
            onValueChange={(value) => {
              setValue("stage", value as OperationFormValues["stage"], {
                shouldValidate: true,
              });
              setValue("departmentType", undefined);
              setValue("department", "");
            }}
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

        <div className="flex flex-col gap-2">
          <Label htmlFor="lotNo">Lot No</Label>
          <Input
            id="lotNo"
            placeholder="e.g. LOT-001, LOT-A"
            {...register("lotNo")}
          />
          {errors.lotNo ? (
            <p className="text-sm text-destructive">{errors.lotNo.message}</p>
          ) : (
            <p className="text-xs text-muted-foreground">
              Optional. Must be unique. Used to track which production batch this
              operation belongs to.
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Label>Production Department</Label>
          <Select
            key={stage}
            value={departmentType}
            onValueChange={(value) => {
              const next = value as OperationDepartment;
              setValue("departmentType", next, { shouldValidate: true });
              const currentName = watch("department") ?? "";
              const isExistingLabel = Object.values(DEPARTMENT_LABELS).includes(
                currentName
              );
              if (!currentName.trim() || isExistingLabel) {
                setValue("department", DEPARTMENT_LABELS[next]);
              }
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select department (optional)" />
            </SelectTrigger>
            <SelectContent>
              {departmentOptions.map((dept) => (
                <SelectItem key={dept} value={dept}>
                  {DEPARTMENT_LABELS[dept]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="department">Department Name</Label>
          <Input
            id="department"
            placeholder="Custom name e.g. 'Flatlock Machine 1'"
            {...register("department")}
          />
          <p className="text-xs text-muted-foreground">
            Optional custom name for this specific department or machine.
          </p>
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
