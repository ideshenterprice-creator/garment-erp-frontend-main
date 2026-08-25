"use client";

import { useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import type { CreateContainerPayload, PurchaseOrder } from "@/types";
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
import { QUERY_KEYS } from "@/constants/queryKeys";
import { toIsoDate, todayInputValue } from "@/lib/boxing";
import { getErrorMessage } from "@/lib/errorHandler";
import { createContainer } from "@/services/boxing.service";

const schema = z.object({
  poId: z.string().uuid("PO is required"),
  destination: z.string().min(1, "Destination is required"),
  dispatchDate: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface NewContainerDrawerProps {
  open: boolean;
  purchaseOrders: PurchaseOrder[];
  onClose: () => void;
}

export function NewContainerDrawer({
  open,
  purchaseOrders,
  onClose,
}: NewContainerDrawerProps) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      poId: "",
      destination: "",
      dispatchDate: "",
    },
  });

  const poId = watch("poId");

  useEffect(() => {
    if (!open) return;
    reset({
      poId: "",
      destination: "",
      dispatchDate: "",
    });
  }, [open, reset]);

  useEffect(() => {
    if (!poId) return;
    const po = purchaseOrders.find((item) => item.id === poId);
    if (po?.shippingDestination) {
      setValue("destination", po.shippingDestination, { shouldValidate: true });
    }
  }, [poId, purchaseOrders, setValue]);

  const createMutation = useMutation({
    mutationFn: (data: CreateContainerPayload) => createContainer(data),
    onSuccess: (response) => {
      toast.success(`Container ${response.data.containerNumber} created.`);
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CONTAINERS });
      onClose();
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to create container."));
    },
  });

  function onSubmit(values: FormValues) {
    const payload: CreateContainerPayload = {
      poId: values.poId,
      destination: values.destination,
    };
    if (values.dispatchDate) {
      payload.dispatchDate = toIsoDate(values.dispatchDate);
    }
    createMutation.mutate(payload);
  }

  return (
    <DrawerForm
      open={open}
      onClose={() => {
        if (!createMutation.isPending) onClose();
      }}
      title="New Container"
      description="Create a container for packing and dispatch"
      footer={
        <div className="flex flex-col gap-2">
          <Button
            type="submit"
            form="new-container-form"
            disabled={createMutation.isPending}
            className="w-full bg-[#1b3a3a] text-white hover:bg-[#1b3a3a]/90"
          >
            {createMutation.isPending ? "Saving..." : "Create Container"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="w-full"
            onClick={onClose}
            disabled={createMutation.isPending}
          >
            Cancel
          </Button>
        </div>
      }
    >
      <form
        id="new-container-form"
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
      >
        <div className="flex flex-col gap-2">
          <Label>Purchase Order *</Label>
          <Select
            value={poId || undefined}
            onValueChange={(value) =>
              setValue("poId", value, { shouldValidate: true })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select PO" />
            </SelectTrigger>
            <SelectContent>
              {purchaseOrders.map((po) => (
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

        <div className="flex flex-col gap-2">
          <Label htmlFor="destination">Destination *</Label>
          <Input id="destination" {...register("destination")} />
          {errors.destination ? (
            <p className="text-sm text-destructive">
              {errors.destination.message}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="dispatchDate">Dispatch Date (optional)</Label>
          <Input
            id="dispatchDate"
            type="date"
            min={todayInputValue()}
            {...register("dispatchDate")}
          />
        </div>
      </form>
    </DrawerForm>
  );
}
