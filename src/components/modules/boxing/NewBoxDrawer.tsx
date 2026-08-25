"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import type { CreateBoxPayload, PurchaseOrder } from "@/types";
import { DrawerForm } from "@/components/common/DrawerForm";
import { BoxSizeInputGrid } from "@/components/modules/boxing/BoxSizeInputGrid";
import { StockInfoBox } from "@/components/modules/boxing/StockInfoBox";
import { TotalPiecesDisplay } from "@/components/modules/boxing/TotalPiecesDisplay";
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
import {
  emptyBoxSizes,
  finishedStockAvailable,
  sumBoxSizes,
  type BoxSizeQty,
} from "@/lib/boxing";
import { getErrorMessage } from "@/lib/errorHandler";
import { createBox } from "@/services/boxing.service";
import { getStock } from "@/services/inventory.service";
import { getPurchaseOrderById } from "@/services/purchaseOrders.service";

const boxSchema = z.object({
  poId: z.string().uuid("PO is required"),
  poItemId: z.string().uuid("Design is required"),
  designNumber: z.string().min(1, "Design is required"),
  color: z.string().min(1, "Color is required"),
});

type BoxFormValues = z.infer<typeof boxSchema>;

interface NewBoxDrawerProps {
  open: boolean;
  purchaseOrders: PurchaseOrder[];
  onClose: () => void;
}

export function NewBoxDrawer({
  open,
  purchaseOrders,
  onClose,
}: NewBoxDrawerProps) {
  const queryClient = useQueryClient();
  const [sizes, setSizes] = useState<BoxSizeQty>(emptyBoxSizes());

  const {
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BoxFormValues>({
    resolver: zodResolver(boxSchema),
    defaultValues: {
      poId: "",
      poItemId: "",
      designNumber: "",
      color: "",
    },
  });

  const poId = watch("poId");
  const poItemId = watch("poItemId");
  const designNumber = watch("designNumber");
  const color = watch("color");
  const total = sumBoxSizes(sizes);

  const poDetailQuery = useQuery({
    queryKey: [...QUERY_KEYS.PURCHASE_ORDERS, poId],
    queryFn: () => getPurchaseOrderById(poId),
    enabled: open && Boolean(poId),
  });

  const stockQuery = useQuery({
    queryKey: [...QUERY_KEYS.STOCK, { category: "FINISHED_GOOD", limit: 100 }],
    queryFn: () => getStock({ category: "FINISHED_GOOD", limit: 100 }),
    enabled: open && Boolean(designNumber) && Boolean(color),
  });

  const designs = useMemo(
    () => poDetailQuery.data?.data.items ?? [],
    [poDetailQuery.data]
  );

  const available = finishedStockAvailable(
    stockQuery.data?.data.data ?? [],
    designNumber,
    color
  );
  const stockError = total > 0 && total > available;

  useEffect(() => {
    if (!open) return;
    reset({
      poId: "",
      poItemId: "",
      designNumber: "",
      color: "",
    });
    setSizes(emptyBoxSizes());
  }, [open, reset]);

  useEffect(() => {
    if (!poItemId) return;
    const item = designs.find((d) => d.id === poItemId);
    if (!item) return;
    setValue("designNumber", item.designNumber, { shouldValidate: true });
    setValue("color", item.color, { shouldValidate: true });
  }, [poItemId, designs, setValue]);

  useEffect(() => {
    setValue("poItemId", "", { shouldValidate: false });
    setValue("designNumber", "", { shouldValidate: false });
    setValue("color", "", { shouldValidate: false });
  }, [poId, setValue]);

  const createMutation = useMutation({
    mutationFn: (data: CreateBoxPayload) => createBox(data),
    onSuccess: (response) => {
      toast.success(
        `Box ${response.data.boxNumber} packed successfully.`
      );
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BOXES });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.STOCK });
      onClose();
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to pack box."));
    },
  });

  function onSubmit(values: BoxFormValues) {
    if (total <= 0) {
      toast.error("At least one size quantity must be greater than 0");
      return;
    }
    if (stockError) return;
    createMutation.mutate({
      poId: values.poId,
      poItemId: values.poItemId,
      designNumber: values.designNumber,
      color: values.color,
      ...sizes,
    });
  }

  return (
    <DrawerForm
      open={open}
      onClose={() => {
        if (!createMutation.isPending) onClose();
      }}
      title="New Box Entry"
      description="Pack finished garments into a numbered box"
      footer={
        <div className="flex flex-col gap-2">
          <Button
            type="submit"
            form="new-box-form"
            disabled={createMutation.isPending || stockError || total <= 0}
            className="w-full bg-[#1b3a3a] text-white hover:bg-[#1b3a3a]/90"
          >
            {createMutation.isPending ? "Saving..." : "Save Box Entry"}
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
        id="new-box-form"
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label>Box No</Label>
            <Input
              value="Auto-generated"
              readOnly
              disabled
              className="bg-slate-50"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>PO Reference *</Label>
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
                    {po.poNumber} ({po.status})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.poId ? (
              <p className="text-sm text-destructive">{errors.poId.message}</p>
            ) : null}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label>Design No *</Label>
            <Select
              value={poItemId || undefined}
              onValueChange={(value) =>
                setValue("poItemId", value, { shouldValidate: true })
              }
              disabled={!poId || poDetailQuery.isLoading}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    !poId
                      ? "Select a PO first"
                      : poDetailQuery.isLoading
                        ? "Loading designs..."
                        : "Select design"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {designs.map((design) => (
                  <SelectItem key={design.id} value={design.id}>
                    {design.designNumber} — {design.color}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.poItemId || errors.designNumber ? (
              <p className="text-sm text-destructive">
                {errors.poItemId?.message ?? errors.designNumber?.message}
              </p>
            ) : null}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="color">Color *</Label>
            <Input
              id="color"
              value={color}
              onChange={(event) =>
                setValue("color", event.target.value, { shouldValidate: true })
              }
            />
            {errors.color ? (
              <p className="text-sm text-destructive">{errors.color.message}</p>
            ) : null}
          </div>
        </div>

        <BoxSizeInputGrid
          values={sizes}
          onChange={(key, value) =>
            setSizes((prev) => ({ ...prev, [key]: value }))
          }
        />
        <TotalPiecesDisplay total={total} />
        {designNumber && color ? (
          <StockInfoBox
            designNumber={designNumber}
            color={color}
            available={available}
            packing={total}
            error={stockError}
          />
        ) : null}
      </form>
    </DrawerForm>
  );
}
