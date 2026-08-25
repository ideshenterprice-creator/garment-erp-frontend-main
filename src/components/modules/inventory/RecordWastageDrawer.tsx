"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Info } from "lucide-react";
import { toast } from "sonner";
import type { CreateWastagePayload } from "@/types";
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
import { QUERY_KEYS } from "@/constants/queryKeys";
import { getErrorMessage } from "@/lib/errorHandler";
import { createWastage } from "@/services/inventory.service";
import { getParties, getProducts } from "@/services/masters.service";
import { getPurchaseOrders } from "@/services/purchaseOrders.service";

const wastageSchema = z.object({
  poId: z.string().uuid("Purchase order is required"),
  designCode: z.string().min(1, "Design code is required"),
  fabricProductId: z.string().uuid("Fabric type is required"),
  wastageQty: z.number().positive("Wastage quantity must be positive"),
  returnedByPartyId: z.string().uuid("Returned by is required"),
  dateOfReturn: z.string().min(1, "Date of return is required"),
  remarks: z.string().optional(),
});

type WastageFormValues = z.infer<typeof wastageSchema>;

interface RecordWastageDrawerProps {
  open: boolean;
  onClose: () => void;
}

function todayInputValue(): string {
  return new Date().toISOString().slice(0, 10);
}

function toIsoDate(dateStr: string): string {
  return new Date(`${dateStr}T00:00:00.000Z`).toISOString();
}

export function RecordWastageDrawer({
  open,
  onClose,
}: RecordWastageDrawerProps) {
  const queryClient = useQueryClient();

  const posQuery = useQuery({
    queryKey: [...QUERY_KEYS.PURCHASE_ORDERS, { limit: 100 }],
    queryFn: () => getPurchaseOrders({ limit: 100 }),
    enabled: open,
  });

  const productsQuery = useQuery({
    queryKey: [
      ...QUERY_KEYS.PRODUCTS,
      { category: "RAW_MATERIAL", limit: 100 },
    ],
    queryFn: () => getProducts({ category: "RAW_MATERIAL", limit: 100 }),
    enabled: open,
  });

  const karigarsQuery = useQuery({
    queryKey: [...QUERY_KEYS.PARTIES, { type: "KARIGAR", limit: 100 }],
    queryFn: () => getParties({ type: "KARIGAR", limit: 100 }),
    enabled: open,
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<WastageFormValues>({
    resolver: zodResolver(wastageSchema),
    defaultValues: {
      poId: "",
      designCode: "",
      fabricProductId: "",
      wastageQty: 0,
      returnedByPartyId: "",
      dateOfReturn: todayInputValue(),
      remarks: "",
    },
  });

  useEffect(() => {
    if (!open) return;
    reset({
      poId: "",
      designCode: "",
      fabricProductId: "",
      wastageQty: 0,
      returnedByPartyId: "",
      dateOfReturn: todayInputValue(),
      remarks: "",
    });
  }, [open, reset]);

  const createMutation = useMutation({
    mutationFn: (data: CreateWastagePayload) => createWastage(data),
    onSuccess: () => {
      toast.success("Wastage recorded.");
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.WASTAGE });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.STOCK });
      onClose();
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to record wastage."));
    },
  });

  function onSubmit(values: WastageFormValues) {
    createMutation.mutate({
      poId: values.poId,
      designCode: values.designCode.trim(),
      fabricProductId: values.fabricProductId,
      wastageQty: values.wastageQty,
      returnedByPartyId: values.returnedByPartyId,
      dateOfReturn: toIsoDate(values.dateOfReturn),
      remarks: values.remarks?.trim() || undefined,
    });
  }

  const dropdownsLoading =
    posQuery.isLoading || productsQuery.isLoading || karigarsQuery.isLoading;

  return (
    <DrawerForm
      open={open}
      onClose={() => {
        if (!createMutation.isPending) onClose();
      }}
      title="Record Wastage Return"
      description="Capture fabric leftovers from cutting floor"
      footer={
        <div className="flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={createMutation.isPending}
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="record-wastage-form"
            disabled={createMutation.isPending || dropdownsLoading}
            className="bg-[#1b3a3a] text-white hover:bg-[#1b3a3a]/90"
          >
            {createMutation.isPending ? "Saving..." : "Save Record"}
          </Button>
        </div>
      }
    >
      <form
        id="record-wastage-form"
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
      >
        <div className="flex flex-col gap-2">
          <Label>
            Purchase Order Number <span className="text-red-500">*</span>
          </Label>
          <Select
            value={watch("poId") || undefined}
            onValueChange={(value) =>
              setValue("poId", value, { shouldValidate: true })
            }
            disabled={posQuery.isLoading}
          >
            <SelectTrigger>
              <SelectValue
                placeholder={posQuery.isLoading ? "Loading..." : "Select PO..."}
              />
            </SelectTrigger>
            <SelectContent>
              {(posQuery.data?.data.data ?? []).map((po) => (
                <SelectItem key={po.id} value={po.id}>
                  {po.poNumber}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.poId ? (
            <p className="text-sm text-destructive">{errors.poId.message}</p>
          ) : null}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="designCode">
              Design Code <span className="text-red-500">*</span>
            </Label>
            <Input
              id="designCode"
              placeholder="e.g. D-46"
              {...register("designCode")}
            />
            {errors.designCode ? (
              <p className="text-sm text-destructive">
                {errors.designCode.message}
              </p>
            ) : null}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="dateOfReturn">
              Date of Return <span className="text-red-500">*</span>
            </Label>
            <Input
              id="dateOfReturn"
              type="date"
              {...register("dateOfReturn")}
            />
            {errors.dateOfReturn ? (
              <p className="text-sm text-destructive">
                {errors.dateOfReturn.message}
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label>
            Fabric Type <span className="text-red-500">*</span>
          </Label>
          <Select
            value={watch("fabricProductId") || undefined}
            onValueChange={(value) =>
              setValue("fabricProductId", value, { shouldValidate: true })
            }
            disabled={productsQuery.isLoading}
          >
            <SelectTrigger>
              <SelectValue
                placeholder={
                  productsQuery.isLoading ? "Loading..." : "Select Fabric..."
                }
              />
            </SelectTrigger>
            <SelectContent>
              {(productsQuery.data?.data.data ?? []).map((product) => (
                <SelectItem key={product.id} value={product.id}>
                  {product.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.fabricProductId ? (
            <p className="text-sm text-destructive">
              {errors.fabricProductId.message}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="wastageQty">
            Wastage Quantity (kg) <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Input
              id="wastageQty"
              type="number"
              step="0.01"
              placeholder="0.00"
              className="pr-12"
              {...register("wastageQty", { valueAsNumber: true })}
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold uppercase text-slate-400">
              KG
            </span>
          </div>
          {errors.wastageQty ? (
            <p className="text-sm text-destructive">
              {errors.wastageQty.message}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-2">
          <Label>
            Returned By (Cutter Name) <span className="text-red-500">*</span>
          </Label>
          <Select
            value={watch("returnedByPartyId") || undefined}
            onValueChange={(value) =>
              setValue("returnedByPartyId", value, { shouldValidate: true })
            }
            disabled={karigarsQuery.isLoading}
          >
            <SelectTrigger>
              <SelectValue
                placeholder={
                  karigarsQuery.isLoading
                    ? "Loading..."
                    : "Select karigar"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {(karigarsQuery.data?.data.data ?? []).map((party) => (
                <SelectItem key={party.id} value={party.id}>
                  {party.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.returnedByPartyId ? (
            <p className="text-sm text-destructive">
              {errors.returnedByPartyId.message}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="remarks">Remarks / Notes</Label>
          <Textarea
            id="remarks"
            rows={3}
            placeholder="Additional details..."
            {...register("remarks")}
          />
        </div>

        <div className="flex items-start gap-2 rounded-lg bg-slate-100 px-3 py-3 text-sm text-slate-600">
          <Info className="mt-0.5 size-4 shrink-0 text-amber-700" />
          <p>
            By recording this wastage, it will be added to the &apos;IN
            STOCK&apos; inventory and available for resale or disposal value
            tracking.
          </p>
        </div>
      </form>
    </DrawerForm>
  );
}
