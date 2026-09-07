"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type {
  CreateKarigarPayload,
  KarigarProfile,
  OperationStage,
} from "@/types";
import { DEPARTMENT_LABELS } from "@/types";
import { DrawerForm } from "@/components/common/DrawerForm";
import {
  departmentBadgeVariant,
  StatusBadge,
} from "@/components/common/StatusBadge";
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
import { getErrorMessage } from "@/lib/errorHandler";
import { QUERY_KEYS } from "@/constants/queryKeys";
import {
  createKarigar,
  getDesignations,
  getKarigars,
  getOperations,
  getParties,
  updateKarigar,
} from "@/services/masters.service";

const karigarSchema = z
  .object({
    partyId: z.string().min(1, "Party is required"),
    designationId: z.string().optional(),
    paymentType: z.enum(["PIECE_RATE", "WEEKLY_SALARY", "BOTH"]),
    weeklySalary: z.number().min(0).optional(),
    operationIds: z.array(z.string()).optional(),
  })
  .superRefine((values, ctx) => {
    if (
      (values.paymentType === "WEEKLY_SALARY" || values.paymentType === "BOTH") &&
      (values.weeklySalary === undefined ||
        Number.isNaN(values.weeklySalary) ||
        values.weeklySalary <= 0)
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
}

const defaultValues: KarigarFormValues = {
  partyId: "",
  designationId: "",
  paymentType: "PIECE_RATE",
  weeklySalary: 0,
  operationIds: [],
};

const STAGE_ORDER: OperationStage[] = [
  "CUTTING",
  "PRINTING",
  "COLORING",
  "STITCHING",
  "FINISHING",
];

function stageLabel(stage: OperationStage) {
  return stage.charAt(0) + stage.slice(1).toLowerCase();
}

function stageVariant(stage: OperationStage) {
  switch (stage) {
    case "CUTTING":
      return "cutting" as const;
    case "PRINTING":
      return "printing" as const;
    case "COLORING":
      return "coloring" as const;
    case "STITCHING":
      return "stitching" as const;
    case "FINISHING":
      return "finishing" as const;
  }
}

export function KarigarDrawer({ open, onClose, karigar }: KarigarDrawerProps) {
  const isEdit = Boolean(karigar);
  const queryClient = useQueryClient();

  const partiesQuery = useQuery({
    queryKey: [...QUERY_KEYS.PARTIES, { type: "KARIGAR", limit: 100 }],
    queryFn: () => getParties({ type: "KARIGAR", limit: 100 }),
    enabled: open,
  });

  const existingKarigarsQuery = useQuery({
    queryKey: [...QUERY_KEYS.KARIGARS, { limit: 100 }],
    queryFn: () => getKarigars({ limit: 100 }),
    enabled: open && !isEdit,
  });

  const operationsQuery = useQuery({
    queryKey: [...QUERY_KEYS.OPERATIONS, { limit: 100 }],
    queryFn: () => getOperations({ limit: 100 }),
    enabled: open,
  });

  const designationsQuery = useQuery({
    queryKey: [...QUERY_KEYS.DESIGNATIONS, { isActive: true, limit: 100 }],
    queryFn: () => getDesignations({ isActive: true, limit: 100 }),
    enabled: open,
  });

  const linkedPartyIds = useMemo(() => {
    const profiles = existingKarigarsQuery.data?.data.data ?? [];
    return new Set(profiles.map((profile) => profile.partyId));
  }, [existingKarigarsQuery.data]);

  const availableParties = useMemo(() => {
    const parties = partiesQuery.data?.data.data ?? [];
    if (isEdit && karigar) {
      const current = parties.find((party) => party.id === karigar.partyId);
      const others = parties.filter(
        (party) => !linkedPartyIds.has(party.id) || party.id === karigar.partyId
      );
      if (current && !others.some((party) => party.id === current.id)) {
        return [current, ...others];
      }
      return others.length ? others : current ? [current] : parties;
    }
    return parties.filter((party) => !linkedPartyIds.has(party.id));
  }, [partiesQuery.data, linkedPartyIds, isEdit, karigar]);

  const operations = operationsQuery.data?.data.data ?? [];

  const operationsByStage = useMemo(() => {
    const grouped = new Map<OperationStage, typeof operations>();
    for (const stage of STAGE_ORDER) {
      grouped.set(stage, []);
    }
    for (const operation of operations) {
      const list = grouped.get(operation.stage) ?? [];
      list.push(operation);
      grouped.set(operation.stage, list);
    }
    return STAGE_ORDER.map((stage) => ({
      stage,
      items: grouped.get(stage) ?? [],
    })).filter((group) => group.items.length > 0);
  }, [operations]);

  const dropdownsLoading =
    partiesQuery.isLoading ||
    operationsQuery.isLoading ||
    designationsQuery.isLoading ||
    (!isEdit && existingKarigarsQuery.isLoading);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<KarigarFormValues>({
    resolver: zodResolver(karigarSchema),
    defaultValues,
  });

  const paymentType = watch("paymentType");
  const partyId = watch("partyId");
  const designationId = watch("designationId");
  const operationIds = watch("operationIds") ?? [];

  useEffect(() => {
    if (!open) return;
    if (karigar) {
      reset({
        partyId: karigar.partyId,
        designationId: karigar.designationId ?? "",
        paymentType: karigar.paymentType,
        weeklySalary: Number(karigar.weeklySalary ?? 0),
        operationIds: karigar.operations.map((item) => item.id),
      });
    } else {
      reset({
        ...defaultValues,
        partyId: "",
      });
    }
  }, [open, karigar, reset]);

  function toggleOperation(operationId: string) {
    const next = operationIds.includes(operationId)
      ? operationIds.filter((id) => id !== operationId)
      : [...operationIds, operationId];
    setValue("operationIds", next, { shouldValidate: true });
  }

  const addKarigarMutation = useMutation({
    mutationFn: (data: CreateKarigarPayload) => createKarigar(data),
    onSuccess: () => {
      toast.success("Karigar profile created.");
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.KARIGARS });
      onClose();
      reset(defaultValues);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to create karigar profile."));
    },
  });

  const editKarigarMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<CreateKarigarPayload>;
    }) => updateKarigar(id, data),
    onSuccess: () => {
      toast.success("Karigar profile updated.");
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.KARIGARS });
      if (karigar?.id) {
        void queryClient.invalidateQueries({
          queryKey: [...QUERY_KEYS.KARIGARS, karigar.id],
        });
      }
      onClose();
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to update karigar profile."));
    },
  });

  const isPending =
    addKarigarMutation.isPending || editKarigarMutation.isPending;

  function onSubmit(values: KarigarFormValues) {
    const payload: CreateKarigarPayload = {
      partyId: values.partyId,
      ...(values.designationId ? { designationId: values.designationId } : {}),
      paymentType: values.paymentType,
      ...(values.paymentType === "WEEKLY_SALARY" || values.paymentType === "BOTH"
        ? { weeklySalary: values.weeklySalary }
        : {}),
      ...(values.paymentType === "PIECE_RATE" || values.paymentType === "BOTH"
        ? { operationIds: values.operationIds }
        : { operationIds: [] }),
    };

    if (isEdit && karigar) {
      editKarigarMutation.mutate({ id: karigar.id, data: payload });
      return;
    }
    addKarigarMutation.mutate(payload);
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
          <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="karigar-form"
            disabled={isPending || dropdownsLoading}
            className="bg-[#1b3a3a] text-white hover:bg-[#1b3a3a]/90"
          >
            {isPending
              ? "Saving..."
              : isEdit
                ? "Update Profile"
                : "Save Profile"}
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
            disabled={dropdownsLoading || isEdit}
          >
            <SelectTrigger>
              <SelectValue
                placeholder={
                  dropdownsLoading
                    ? "Loading parties..."
                    : "Select karigar party"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {availableParties.map((party) => (
                <SelectItem key={party.id} value={party.id}>
                  {party.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.partyId ? (
            <p className="text-sm text-destructive">{errors.partyId.message}</p>
          ) : null}
          {!dropdownsLoading && availableParties.length === 0 && !isEdit ? (
            <p className="text-xs text-muted-foreground">
              No available KARIGAR parties. Create a party first, or all are
              already linked.
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-2">
          <Label>Designation</Label>
          <Select
            value={designationId || "none"}
            onValueChange={(value) =>
              setValue("designationId", value === "none" ? "" : value, {
                shouldValidate: true,
              })
            }
            disabled={dropdownsLoading}
          >
            <SelectTrigger>
              <SelectValue
                placeholder={
                  dropdownsLoading ? "Loading designations..." : "Select designation"
                }
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No designation</SelectItem>
              {(designationsQuery.data?.data.data ?? []).map((designation) => (
                <SelectItem key={designation.id} value={designation.id}>
                  {designation.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
            {dropdownsLoading ? (
              <p className="text-sm text-muted-foreground">Loading operations...</p>
            ) : (
              <div className="grid max-h-56 grid-cols-1 gap-3 overflow-y-auto rounded-lg border border-slate-200 p-3">
                {operationsByStage.map((group) => (
                  <div key={group.stage}>
                    <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      {group.stage.charAt(0) + group.stage.slice(1).toLowerCase()}
                    </p>
                    <div className="flex flex-col gap-1">
                      {group.items.map((operation) => {
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
                            <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                              <span className="truncate">
                                {operation.departmentType
                                  ? `${operation.name} — ${stageLabel(operation.stage)} — ${DEPARTMENT_LABELS[operation.departmentType]}`
                                  : `${operation.name} — ${stageLabel(operation.stage)}`}
                              </span>
                              <span className="flex flex-wrap items-center gap-1">
                                <StatusBadge
                                  label={stageLabel(operation.stage)}
                                  variant={stageVariant(operation.stage)}
                                />
                                {operation.departmentType ? (
                                  <StatusBadge
                                    label={
                                      DEPARTMENT_LABELS[operation.departmentType]
                                    }
                                    variant={departmentBadgeVariant(
                                      operation.departmentType
                                    )}
                                  />
                                ) : null}
                              </span>
                            </span>
                            <span className="text-xs text-muted-foreground">
                              ₹{Number(operation.ratePerPiece).toFixed(2)}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {errors.operationIds ? (
              <p className="text-sm text-destructive">
                {errors.operationIds.message}
              </p>
            ) : null}
          </div>
        ) : null}
      </form>
    </DrawerForm>
  );
}
