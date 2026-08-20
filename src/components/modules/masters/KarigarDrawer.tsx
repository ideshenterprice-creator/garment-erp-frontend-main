"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import type { KarigarPaymentType, KarigarProfile } from "@/types";
import { mockOperations, mockParties } from "@/mock/masters";
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
import { cn } from "@/lib/utils";

const karigarSchema = z
  .object({
    partyId: z.string().min(1, "Party is required"),
    paymentType: z.enum(["PIECE_RATE", "WEEKLY_SALARY", "BOTH"]),
    weeklySalary: z.number().min(0).optional(),
    operationIds: z.array(z.string()).optional(),
    isActive: z.boolean(),
  })
  .superRefine((values, ctx) => {
    if (
      (values.paymentType === "WEEKLY_SALARY" || values.paymentType === "BOTH") &&
      (values.weeklySalary === undefined || Number.isNaN(values.weeklySalary))
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["weeklySalary"],
        message: "Weekly salary is required",
      });
    }
    if (
      (values.paymentType === "PIECE_RATE" || values.paymentType === "BOTH") &&
      (!values.operationIds || values.operationIds.length === 0)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["operationIds"],
        message: "Select at least one operation",
      });
    }
  });

type KarigarFormValues = z.infer<typeof karigarSchema>;

interface KarigarDrawerProps {
  open: boolean;
  onClose: () => void;
  karigar?: KarigarProfile | null;
  onSave: (karigar: KarigarProfile) => void;
}

const defaultValues: KarigarFormValues = {
  partyId: "",
  paymentType: "PIECE_RATE",
  weeklySalary: 0,
  operationIds: [],
  isActive: true,
};

export function KarigarDrawer({
  open,
  onClose,
  karigar,
  onSave,
}: KarigarDrawerProps) {
  const isEdit = Boolean(karigar);
  const karigarParties = useMemo(
    () => mockParties.filter((party) => party.type === "KARIGAR"),
    []
  );

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<KarigarFormValues>({
    resolver: zodResolver(karigarSchema),
    defaultValues,
  });

  const paymentType = watch("paymentType");
  const partyId = watch("partyId");
  const operationIds = watch("operationIds") ?? [];
  const isActive = watch("isActive");

  useEffect(() => {
    if (!open) return;
    if (karigar) {
      reset({
        partyId: karigar.partyId,
        paymentType: karigar.paymentType,
        weeklySalary: karigar.weeklySalary,
        operationIds: karigar.operations.map((item) => item.operationId),
        isActive: karigar.isActive,
      });
    } else {
      reset({
        ...defaultValues,
        partyId: karigarParties[0]?.id ?? "",
      });
    }
  }, [open, karigar, reset, karigarParties]);

  function toggleOperation(operationId: string) {
    const next = operationIds.includes(operationId)
      ? operationIds.filter((id) => id !== operationId)
      : [...operationIds, operationId];
    setValue("operationIds", next, { shouldValidate: true });
  }

  function onSubmit(values: KarigarFormValues) {
    const party =
      mockParties.find((item) => item.id === values.partyId) ??
      karigar?.party ??
      mockParties[0];

    const operations = mockOperations
      .filter((operation) => (values.operationIds ?? []).includes(operation.id))
      .map((operation, index) => ({
        id: `ko-${Date.now()}-${index}`,
        karigarProfileId: karigar?.id ?? "new",
        operationId: operation.id,
        operation,
      }));

    const next: KarigarProfile = {
      id: karigar?.id ?? `kar-${Date.now()}`,
      partyId: values.partyId,
      party,
      paymentType: values.paymentType as KarigarPaymentType,
      weeklySalary:
        values.paymentType === "PIECE_RATE" ? 0 : (values.weeklySalary ?? 0),
      isActive: values.isActive,
      operations:
        values.paymentType === "WEEKLY_SALARY" ? [] : operations,
    };

    onSave(next);
    toast.success(
      isEdit ? "Karigar profile updated successfully" : "Karigar profile saved successfully"
    );
    onClose();
  }

  const showSalary =
    paymentType === "WEEKLY_SALARY" || paymentType === "BOTH";
  const showOperations =
    paymentType === "PIECE_RATE" || paymentType === "BOTH";

  return (
    <DrawerForm
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Karigar Profile" : "Add Karigar Profile"}
      description="Link a party and configure payment rules."
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="karigar-form"
            disabled={isSubmitting}
            className="bg-[#1b3a3a] text-white hover:bg-[#1b3a3a]/90"
          >
            {isEdit ? "Update Profile" : "Save Profile"}
          </Button>
        </div>
      }
    >
      <form
        id="karigar-form"
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-5"
      >
        <div className="flex flex-col gap-2">
          <Label>
            Party <span className="text-red-500">*</span>
          </Label>
          <Select
            value={partyId}
            onValueChange={(value) =>
              setValue("partyId", value, { shouldValidate: true })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select karigar party" />
            </SelectTrigger>
            <SelectContent>
              {karigarParties.map((party) => (
                <SelectItem key={party.id} value={party.id}>
                  {party.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.partyId ? (
            <p className="text-sm text-destructive">{errors.partyId.message}</p>
          ) : null}
        </div>

        <div className="flex flex-col gap-2">
          <Label>
            Payment Type <span className="text-red-500">*</span>
          </Label>
          <Select
            value={paymentType}
            onValueChange={(value) =>
              setValue("paymentType", value as KarigarFormValues["paymentType"], {
                shouldValidate: true,
              })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PIECE_RATE">Piece Rate</SelectItem>
              <SelectItem value="WEEKLY_SALARY">Weekly Salary</SelectItem>
              <SelectItem value="BOTH">Both</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {showSalary ? (
          <div className="flex flex-col gap-2">
            <Label htmlFor="weeklySalary">
              Weekly Salary (₹) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="weeklySalary"
              type="number"
              {...register("weeklySalary", { valueAsNumber: true })}
            />
            {errors.weeklySalary ? (
              <p className="text-sm text-destructive">
                {errors.weeklySalary.message}
              </p>
            ) : null}
          </div>
        ) : null}

        {showOperations ? (
          <div className="flex flex-col gap-2">
            <Label>
              Assigned Operations <span className="text-red-500">*</span>
            </Label>
            <div className="grid max-h-48 grid-cols-1 gap-2 overflow-y-auto rounded-lg border border-slate-200 p-3">
              {mockOperations.map((operation) => {
                const checked = operationIds.includes(operation.id);
                return (
                  <label
                    key={operation.id}
                    className={cn(
                      "flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm",
                      checked ? "bg-slate-100" : "hover:bg-slate-50"
                    )}
                  >
                    <input
                      type="checkbox"
                      className="size-4 accent-[#1b3a3a]"
                      checked={checked}
                      onChange={() => toggleOperation(operation.id)}
                    />
                    <span className="flex-1">{operation.name}</span>
                    <span className="text-xs text-muted-foreground">
                      ₹{operation.ratePerPiece.toFixed(2)}
                    </span>
                  </label>
                );
              })}
            </div>
            {errors.operationIds ? (
              <p className="text-sm text-destructive">
                {errors.operationIds.message}
              </p>
            ) : null}
          </div>
        ) : null}

        <section className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
          <div>
            <p className="text-sm font-medium text-slate-900">Active Status</p>
            <p className="text-xs text-muted-foreground">
              Inactive karigars are hidden from production assignment.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={isActive}
            onClick={() => setValue("isActive", !isActive)}
            className={cn(
              "relative h-6 w-11 rounded-full transition-colors",
              isActive ? "bg-[#1b3a3a]" : "bg-slate-300"
            )}
          >
            <span
              className={cn(
                "absolute top-0.5 size-5 rounded-full bg-white transition-transform",
                isActive ? "left-5" : "left-0.5"
              )}
            />
          </button>
        </section>
      </form>
    </DrawerForm>
  );
}
