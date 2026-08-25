"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check } from "lucide-react";
import { toast } from "sonner";
import type { CreatePurchaseOrderPayload } from "@/types";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import {
  createEmptyPOItem,
  POItemsFormSection,
  type POItemFormRow,
} from "@/components/modules/purchase-orders/POItemsFormSection";
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
import { ROUTES } from "@/constants/routes";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { PAYMENT_TERMS_OPTIONS } from "@/lib/purchaseOrders";
import { getErrorMessage } from "@/lib/errorHandler";
import { getParties } from "@/services/masters.service";
import { createPurchaseOrder } from "@/services/purchaseOrders.service";

const poFormSchema = z
  .object({
    buyerId: z.string().uuid("Buyer is required"),
    buyerPoReference: z.string().min(1, "Buyer PO reference is required"),
    orderDate: z.string().min(1, "Order date is required"),
    deliveryDate: z.string().min(1, "Delivery date is required"),
    shippingDestination: z.string().min(1, "Shipping destination is required"),
    paymentTerms: z.string().min(1, "Payment terms are required"),
    specialInstructions: z.string().optional(),
  })
  .superRefine((values, ctx) => {
    if (
      values.orderDate &&
      values.deliveryDate &&
      new Date(values.deliveryDate) <= new Date(values.orderDate)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["deliveryDate"],
        message: "Delivery date must be after order date",
      });
    }
  });

type POFormValues = z.infer<typeof poFormSchema>;

function toIsoDate(dateStr: string): string {
  return new Date(`${dateStr}T00:00:00.000Z`).toISOString();
}

function todayInputValue(): string {
  return new Date().toISOString().slice(0, 10);
}

export function NewPOForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const presetBuyerId = searchParams.get("buyerId");

  const [items, setItems] = useState<POItemFormRow[]>([createEmptyPOItem()]);
  const [itemErrors, setItemErrors] = useState<Record<string, string>>({});
  const [discardOpen, setDiscardOpen] = useState(false);

  const buyersQuery = useQuery({
    queryKey: [...QUERY_KEYS.PARTIES, { type: "BUYER", limit: 100 }],
    queryFn: () => getParties({ type: "BUYER", limit: 100 }),
  });

  const buyers = buyersQuery.data?.data.data ?? [];

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<POFormValues>({
    resolver: zodResolver(poFormSchema),
    defaultValues: {
      buyerId: "",
      buyerPoReference: "",
      orderDate: todayInputValue(),
      deliveryDate: "",
      shippingDestination: "",
      paymentTerms: PAYMENT_TERMS_OPTIONS[0],
      specialInstructions: "",
    },
  });

  const buyerId = watch("buyerId");
  const paymentTerms = watch("paymentTerms");
  const totalDesigns = items.length;

  useEffect(() => {
    if (presetBuyerId) {
      setValue("buyerId", presetBuyerId, { shouldValidate: true });
    }
  }, [presetBuyerId, setValue]);

  const createPOMutation = useMutation({
    mutationFn: (data: CreatePurchaseOrderPayload) => createPurchaseOrder(data),
    onSuccess: (response) => {
      toast.success(
        `PO ${response.data.poNumber} created successfully.`
      );
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.PURCHASE_ORDERS,
      });
      router.push(ROUTES.PURCHASE_ORDERS.DETAIL(response.data.id));
    },
    onError: (error) => {
      toast.error(
        getErrorMessage(error, "Failed to create purchase order.")
      );
    },
  });

  function validateItems(): boolean {
    const nextErrors: Record<string, string> = {};

    if (items.length < 1) {
      nextErrors.items = "At least one item is required";
    }

    items.forEach((item, index) => {
      if (!item.designNumber.trim()) {
        nextErrors[`items.${index}.designNumber`] = "Design number is required";
      }
      if (!item.garmentType.trim()) {
        nextErrors[`items.${index}.garmentType`] = "Garment type is required";
      }
      if (!item.color.trim()) {
        nextErrors[`items.${index}.color`] = "Color is required";
      }
      const total =
        item.qty_0_3M +
        item.qty_3_6M +
        item.qty_6_9M +
        item.qty_9_12M +
        item.qty_12_18M +
        item.qty_18_24M;
      if (total <= 0) {
        nextErrors[`items.${index}.sizes`] =
          "At least one size quantity must be greater than 0";
      }
    });

    setItemErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function onSubmit(values: POFormValues) {
    if (!validateItems()) return;

    const payload: CreatePurchaseOrderPayload = {
      buyerId: values.buyerId,
      buyerPoReference: values.buyerPoReference,
      orderDate: toIsoDate(values.orderDate),
      deliveryDate: toIsoDate(values.deliveryDate),
      shippingDestination: values.shippingDestination,
      paymentTerms: values.paymentTerms,
      specialInstructions: values.specialInstructions || undefined,
      items: items.map((item) => ({
        designNumber: item.designNumber.trim(),
        garmentType: item.garmentType.trim(),
        color: item.color.trim(),
        qty_0_3M: Number(item.qty_0_3M) || 0,
        qty_3_6M: Number(item.qty_3_6M) || 0,
        qty_6_9M: Number(item.qty_6_9M) || 0,
        qty_9_12M: Number(item.qty_9_12M) || 0,
        qty_12_18M: Number(item.qty_12_18M) || 0,
        qty_18_24M: Number(item.qty_18_24M) || 0,
      })),
    };

    createPOMutation.mutate(payload);
  }

  const isPending = createPOMutation.isPending;

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-[28px]">
            New Purchase Order
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Enter buyer PO details. All production will be linked to this PO
            number.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="submit"
            form="new-po-form"
            disabled={isPending || buyersQuery.isLoading}
            className="bg-[#1b3a3a] text-white hover:bg-[#1b3a3a]/90"
          >
            <Check className="size-4" />
            {isPending ? "Saving..." : "Save PO"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => setDiscardOpen(true)}
            disabled={isPending}
          >
            Discard
          </Button>
        </div>
      </div>

      <form id="new-po-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <div className="grid gap-5 md:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                PO Number
              </Label>
              <Input
                value="Auto-generated"
                readOnly
                disabled
                className="bg-slate-50"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Buyer&apos;s Own PO Reference No
              </Label>
              <Input
                placeholder="Enter Reference No."
                {...register("buyerPoReference")}
              />
              {errors.buyerPoReference ? (
                <p className="text-sm text-destructive">
                  {errors.buyerPoReference.message}
                </p>
              ) : null}
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Buyer Name
              </Label>
              <Select
                value={buyerId || undefined}
                onValueChange={(value) =>
                  setValue("buyerId", value, { shouldValidate: true })
                }
                disabled={buyersQuery.isLoading}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      buyersQuery.isLoading
                        ? "Loading buyers..."
                        : "Select buyer"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {buyers.map((buyer) => (
                    <SelectItem key={buyer.id} value={buyer.id}>
                      {buyer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.buyerId ? (
                <p className="text-sm text-destructive">{errors.buyerId.message}</p>
              ) : null}
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Payment Terms
              </Label>
              <Select
                value={paymentTerms}
                onValueChange={(value) =>
                  setValue("paymentTerms", value, { shouldValidate: true })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_TERMS_OPTIONS.map((term) => (
                    <SelectItem key={term} value={term}>
                      {term}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.paymentTerms ? (
                <p className="text-sm text-destructive">
                  {errors.paymentTerms.message}
                </p>
              ) : null}
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Order Date
              </Label>
              <Input type="date" {...register("orderDate")} />
              {errors.orderDate ? (
                <p className="text-sm text-destructive">{errors.orderDate.message}</p>
              ) : null}
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Delivery Date
              </Label>
              <Input type="date" {...register("deliveryDate")} />
              {errors.deliveryDate ? (
                <p className="text-sm text-destructive">
                  {errors.deliveryDate.message}
                </p>
              ) : null}
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Shipping Destination
              </Label>
              <Input
                placeholder="e.g. Hamburg Port, Germany"
                {...register("shippingDestination")}
              />
              {errors.shippingDestination ? (
                <p className="text-sm text-destructive">
                  {errors.shippingDestination.message}
                </p>
              ) : null}
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Total Designs
              </Label>
              <Input value={totalDesigns} readOnly disabled className="bg-slate-50" />
            </div>

            <div className="flex flex-col gap-2 md:col-span-2">
              <Label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Special Instructions
              </Label>
              <Textarea
                rows={4}
                placeholder="Add any specific requirements for packaging or labeling..."
                {...register("specialInstructions")}
              />
            </div>
          </div>
        </div>

        <POItemsFormSection
          items={items}
          errors={itemErrors}
          onChange={(next) => {
            setItems(next);
            setItemErrors({});
          }}
        />

        <Button
          type="submit"
          disabled={isPending || buyersQuery.isLoading}
          className="h-12 w-full bg-[#1b3a3a] text-base text-white hover:bg-[#1b3a3a]/90"
        >
          <Check className="size-4" />
          {isPending ? "Saving..." : "Save Purchase Order"}
        </Button>
      </form>

      <ConfirmDialog
        open={discardOpen}
        onClose={() => setDiscardOpen(false)}
        title="Discard this purchase order?"
        description="All entered data will be lost."
        confirmLabel="Discard"
        onConfirm={() => router.push(ROUTES.PURCHASE_ORDERS.ROOT)}
      />
    </div>
  );
}
