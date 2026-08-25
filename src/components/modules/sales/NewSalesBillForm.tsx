"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Ban, Save } from "lucide-react";
import { toast } from "sonner";
import type { CreateSalesBillPayload } from "@/types";
import {
  BillItemsTable,
  type BillItemRow,
} from "@/components/modules/sales/BillItemsTable";
import { BillTotalsSection } from "@/components/modules/sales/BillTotalsSection";
import { SubmitBillDialog } from "@/components/modules/sales/SubmitBillDialog";
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
import { ROUTES } from "@/constants/routes";
import { getErrorMessage } from "@/lib/errorHandler";
import {
  finishedStockForDesignSize,
  poItemsToBillDraftItems,
  toIsoDate,
  todayInputValue,
} from "@/lib/sales";
import { getStock } from "@/services/inventory.service";
import { getContainers } from "@/services/boxing.service";
import {
  createSalesBill,
  submitSalesBill,
} from "@/services/sales.service";
import {
  getPurchaseOrderById,
  getPurchaseOrders,
} from "@/services/purchaseOrders.service";

const formSchema = z.object({
  poId: z.string().uuid("PO is required"),
  invoiceDate: z.string().min(1, "Invoice date is required"),
  containerId: z.string().optional(),
  currency: z.string().min(1),
  exchangeRate: z.number().positive(),
  buyerPoReference: z.string().optional(),
  paymentTerms: z.string().optional(),
  shippingDestination: z.string().optional(),
  buyerName: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function NewSalesBillForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [items, setItems] = useState<BillItemRow[]>([]);
  const [submitOpen, setSubmitOpen] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      poId: "",
      invoiceDate: todayInputValue(),
      containerId: "",
      currency: "INR",
      exchangeRate: 1,
      buyerPoReference: "",
      paymentTerms: "",
      shippingDestination: "",
      buyerName: "",
    },
  });

  const poId = watch("poId");
  const currency = watch("currency");
  const containerId = watch("containerId");

  const activePosQuery = useQuery({
    queryKey: [...QUERY_KEYS.PURCHASE_ORDERS, { status: "ACTIVE", limit: 100 }],
    queryFn: () => getPurchaseOrders({ status: "ACTIVE", limit: 100 }),
  });

  const readyPosQuery = useQuery({
    queryKey: [
      ...QUERY_KEYS.PURCHASE_ORDERS,
      { status: "READY_TO_SHIP", limit: 100 },
    ],
    queryFn: () => getPurchaseOrders({ status: "READY_TO_SHIP", limit: 100 }),
  });

  const inProdPosQuery = useQuery({
    queryKey: [
      ...QUERY_KEYS.PURCHASE_ORDERS,
      { status: "IN_PRODUCTION", limit: 100 },
    ],
    queryFn: () => getPurchaseOrders({ status: "IN_PRODUCTION", limit: 100 }),
  });

  const purchaseOrders = useMemo(() => {
    const merged = [
      ...(activePosQuery.data?.data.data ?? []),
      ...(readyPosQuery.data?.data.data ?? []),
      ...(inProdPosQuery.data?.data.data ?? []),
    ];
    return Array.from(new Map(merged.map((po) => [po.id, po])).values());
  }, [activePosQuery.data, readyPosQuery.data, inProdPosQuery.data]);

  const containersQuery = useQuery({
    queryKey: [...QUERY_KEYS.CONTAINERS, { limit: 100 }],
    queryFn: () => getContainers({ limit: 100 }),
  });

  const containers = useMemo(() => {
    const all = containersQuery.data?.data.data ?? [];
    return all.filter(
      (ctn) =>
        (ctn.status === "READY" || ctn.status === "DISPATCHED") &&
        (!poId || ctn.poId === poId)
    );
  }, [containersQuery.data, poId]);

  const poDetailQuery = useQuery({
    queryKey: [...QUERY_KEYS.PURCHASE_ORDERS, poId],
    queryFn: () => getPurchaseOrderById(poId),
    enabled: Boolean(poId),
  });

  const stockQuery = useQuery({
    queryKey: [...QUERY_KEYS.STOCK, { category: "FINISHED_GOOD", limit: 100 }],
    queryFn: () => getStock({ category: "FINISHED_GOOD", limit: 100 }),
  });

  const stockItems = stockQuery.data?.data.data ?? [];

  useEffect(() => {
    const preset = searchParams.get("poId");
    if (preset) setValue("poId", preset, { shouldValidate: true });
  }, [searchParams, setValue]);

  useEffect(() => {
    if (!poId || !poDetailQuery.data?.data) {
      if (!poId) setItems([]);
      return;
    }
    const order = poDetailQuery.data.data;
    setValue("buyerName", order.buyer?.name ?? "");
    setValue("buyerPoReference", order.buyerPoReference ?? "");
    setValue("paymentTerms", order.paymentTerms ?? "");
    setValue("shippingDestination", order.shippingDestination ?? "");

    const draft = poItemsToBillDraftItems(order.items ?? []);
    setItems(
      draft.map((row, index) => {
        const stock = finishedStockForDesignSize(
          stockItems,
          row.designNumber,
          row.sizeLabel
        );
        return {
          id: `row-${row.poItemId}-${row.size}-${index}`,
          poItemId: row.poItemId,
          designNumber: row.designNumber,
          garmentType: row.garmentType,
          color: row.color,
          size: row.size,
          sizeLabel: row.sizeLabel,
          quantity: 0,
          ratePerPiece: 0,
          availableStock: stock.available,
          productId: stock.productId,
        };
      })
    );
  }, [poId, poDetailQuery.data, setValue, stockItems]);

  const subTotal = items.reduce(
    (sum, item) => sum + item.quantity * item.ratePerPiece,
    0
  );
  const hasStockError = items.some(
    (item) => item.quantity > 0 && item.quantity > item.availableStock
  );
  const hasInvalidItems =
    items.length === 0 ||
    items.every((item) => item.quantity <= 0) ||
    items.some(
      (item) =>
        item.quantity > 0 &&
        (item.ratePerPiece <= 0 || !item.poItemId)
    );

  function buildPayload(values: FormValues): CreateSalesBillPayload {
    return {
      poId: values.poId,
      containerId: values.containerId || undefined,
      invoiceDate: toIsoDate(values.invoiceDate),
      currency: values.currency,
      exchangeRate: values.currency === "INR" ? 1 : values.exchangeRate,
      items: items
        .filter((item) => item.quantity > 0)
        .map((item) => ({
          poItemId: item.poItemId!,
          designNumber: item.designNumber,
          garmentType: item.garmentType,
          color: item.color,
          size: item.size,
          quantity: item.quantity,
          ratePerPiece: item.ratePerPiece,
        })),
    };
  }

  const createMutation = useMutation({
    mutationFn: async ({
      values,
      submitAfter,
    }: {
      values: FormValues;
      submitAfter: boolean;
    }) => {
      const created = await createSalesBill(buildPayload(values));
      if (submitAfter) {
        const submitted = await submitSalesBill(created.data.id);
        return submitted.data;
      }
      return created.data;
    },
    onSuccess: (bill, variables) => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SALES_BILLS });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.STOCK });
      toast.success(
        variables.submitAfter ? "Bill submitted." : "Bill saved as draft."
      );
      router.push(ROUTES.SALES.BILL_DETAIL(bill.id));
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to save sales bill."));
    },
  });

  function saveDraft(values: FormValues) {
    if (hasStockError || hasInvalidItems) {
      toast.error("Fix stock and item quantities before saving.");
      return;
    }
    createMutation.mutate({ values, submitAfter: false });
  }

  function confirmSubmit() {
    const values = watch();
    if (hasStockError || hasInvalidItems) return;
    createMutation.mutate({ values, submitAfter: true });
    setSubmitOpen(false);
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-[28px]">
            New Sales Bill
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Generate export invoice. System will block billing if finished stock
            is insufficient.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={createMutation.isPending || hasStockError || hasInvalidItems}
            onClick={handleSubmit(saveDraft)}
          >
            <Save className="size-4" />
            Save as Draft
          </Button>
          <Button
            type="button"
            disabled={
              createMutation.isPending || hasStockError || hasInvalidItems
            }
            className="bg-[#1b3a3a] text-white hover:bg-[#1b3a3a]/90 disabled:opacity-50"
            onClick={handleSubmit(() => setSubmitOpen(true))}
            title={
              hasStockError ? "Fix stock errors before submitting" : undefined
            }
          >
            {hasStockError ? <Ban className="size-4" /> : null}
            Submit Bill
          </Button>
        </div>
      </div>

      <form className="space-y-5">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <div className="flex flex-col gap-2">
              <Label>Invoice No</Label>
              <Input
                value="Auto-generated"
                readOnly
                disabled
                className="bg-slate-50"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>PO Number *</Label>
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
            <div className="flex flex-col gap-2">
              <Label>Buyer PO Reference</Label>
              <Input
                readOnly
                disabled
                className="bg-slate-50"
                {...register("buyerPoReference")}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Buyer</Label>
              <Input
                readOnly
                disabled
                className="bg-slate-50"
                {...register("buyerName")}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Payment Terms</Label>
              <Input
                readOnly
                disabled
                className="bg-slate-50"
                {...register("paymentTerms")}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="invoiceDate">Invoice Date *</Label>
              <Input
                id="invoiceDate"
                type="date"
                {...register("invoiceDate")}
              />
              {errors.invoiceDate ? (
                <p className="text-sm text-destructive">
                  {errors.invoiceDate.message}
                </p>
              ) : null}
            </div>
            <div className="flex flex-col gap-2">
              <Label>Container</Label>
              <Select
                value={containerId || "NONE"}
                onValueChange={(value) =>
                  setValue("containerId", value === "NONE" ? "" : value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select container" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NONE">None</SelectItem>
                  {containers.map((ctn) => (
                    <SelectItem key={ctn.id} value={ctn.id}>
                      {ctn.containerNumber}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label>Currency</Label>
              <Select
                value={currency}
                onValueChange={(value) => {
                  setValue("currency", value);
                  if (value === "INR") setValue("exchangeRate", 1);
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="AED">AED</SelectItem>
                  <SelectItem value="INR">INR</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {currency !== "INR" ? (
              <div className="flex flex-col gap-2">
                <Label htmlFor="exchangeRate">Exchange Rate</Label>
                <Input
                  id="exchangeRate"
                  type="number"
                  step="0.01"
                  {...register("exchangeRate", { valueAsNumber: true })}
                />
              </div>
            ) : null}
            <div className="flex flex-col gap-2 md:col-span-2">
              <Label>Shipping Destination</Label>
              <Input
                readOnly
                disabled
                className="bg-slate-50"
                {...register("shippingDestination")}
              />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-slate-900">
              Bill Items
            </h2>
            <p className="text-sm text-muted-foreground">
              Rows are generated from PO size quantities. Enter bill qty and
              rate.
            </p>
          </div>

          {poId && items.length === 0 ? (
            <p className="rounded-lg bg-amber-50 px-3 py-3 text-sm text-amber-800">
              Selected PO has no size quantities to bill.
            </p>
          ) : (
            <BillItemsTable
              items={items}
              onChangeQty={(id, quantity) =>
                setItems((prev) =>
                  prev.map((item) =>
                    item.id === id ? { ...item, quantity } : item
                  )
                )
              }
              onChangeRate={(id, rate) =>
                setItems((prev) =>
                  prev.map((item) =>
                    item.id === id ? { ...item, ratePerPiece: rate } : item
                  )
                )
              }
            />
          )}

          <div className="mt-5 flex justify-end">
            <BillTotalsSection subTotal={subTotal} netTotal={subTotal} />
          </div>
        </div>
      </form>

      <SubmitBillDialog
        open={submitOpen}
        onClose={() => setSubmitOpen(false)}
        onConfirm={confirmSubmit}
      />
    </div>
  );
}
