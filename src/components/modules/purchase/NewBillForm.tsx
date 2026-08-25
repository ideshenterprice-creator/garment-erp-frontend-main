"use client";

import { useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Package } from "lucide-react";
import { toast } from "sonner";
import type { CreatePurchaseBillPayload } from "@/types";
import { WeightCalculator } from "@/components/modules/purchase/WeightCalculator";
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
import { ROUTES } from "@/constants/routes";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { getErrorMessage } from "@/lib/errorHandler";
import { formatCurrency } from "@/lib/utils";
import { getStockByProduct } from "@/services/inventory.service";
import {
  getGSTRates,
  getParties,
  getProducts,
} from "@/services/masters.service";
import {
  confirmPurchaseBill,
  createPurchaseBill,
} from "@/services/purchase.service";
import {
  getPurchaseOrderById,
  getPurchaseOrders,
} from "@/services/purchaseOrders.service";

const billSchema = z
  .object({
    supplierId: z.string().uuid("Supplier is required"),
    supplierInvoiceNo: z.string().min(1, "Supplier invoice number is required"),
    purchaseDate: z.string().min(1, "Purchase date is required"),
    poId: z.string().uuid("Linked PO is required"),
    productId: z.string().uuid("Fabric type is required"),
    vehicleNumber: z.string().optional(),
    grossWeight: z.number().positive("Gross weight must be positive"),
    tareWeight: z.number().min(0, "Tare weight must be 0 or more"),
    ratePerKg: z.number().positive("Rate per kg must be positive"),
  })
  .superRefine((values, ctx) => {
    if (values.grossWeight <= values.tareWeight) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["grossWeight"],
        message: "Gross weight must be greater than tare weight",
      });
    }
  });

type BillFormValues = z.infer<typeof billSchema>;

function todayInputValue(): string {
  return new Date().toISOString().slice(0, 10);
}

function toIsoDate(dateStr: string): string {
  return new Date(`${dateStr}T00:00:00.000Z`).toISOString();
}

export function NewBillForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const presetPoId = searchParams.get("poId");

  const suppliersQuery = useQuery({
    queryKey: [...QUERY_KEYS.PARTIES, { type: "SUPPLIER", limit: 100 }],
    queryFn: () => getParties({ type: "SUPPLIER", limit: 100 }),
  });

  const activePOsQuery = useQuery({
    queryKey: [...QUERY_KEYS.PURCHASE_ORDERS, { status: "ACTIVE", limit: 100 }],
    queryFn: () => getPurchaseOrders({ status: "ACTIVE", limit: 100 }),
  });

  const inProductionPOsQuery = useQuery({
    queryKey: [
      ...QUERY_KEYS.PURCHASE_ORDERS,
      { status: "IN_PRODUCTION", limit: 100 },
    ],
    queryFn: () => getPurchaseOrders({ status: "IN_PRODUCTION", limit: 100 }),
  });

  const productsQuery = useQuery({
    queryKey: [
      ...QUERY_KEYS.PRODUCTS,
      { category: "RAW_MATERIAL", limit: 100 },
    ],
    queryFn: () => getProducts({ category: "RAW_MATERIAL", limit: 100 }),
  });

  const gstQuery = useQuery({
    queryKey: QUERY_KEYS.GST,
    queryFn: () => getGSTRates(),
  });

  const suppliers = suppliersQuery.data?.data.data ?? [];
  const products = productsQuery.data?.data.data ?? [];
  const gstRates = gstQuery.data?.data ?? [];

  const linkedPOs = useMemo(() => {
    const active = activePOsQuery.data?.data.data ?? [];
    const inProduction = inProductionPOsQuery.data?.data.data ?? [];
    const byId = new Map(
      [...active, ...inProduction].map((order) => [order.id, order])
    );
    return Array.from(byId.values());
  }, [activePOsQuery.data, inProductionPOsQuery.data]);

  const dropdownsLoading =
    suppliersQuery.isLoading ||
    activePOsQuery.isLoading ||
    inProductionPOsQuery.isLoading ||
    productsQuery.isLoading ||
    gstQuery.isLoading;

  const dropdownsReady =
    suppliersQuery.isSuccess &&
    activePOsQuery.isSuccess &&
    inProductionPOsQuery.isSuccess &&
    productsQuery.isSuccess &&
    gstQuery.isSuccess;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BillFormValues>({
    resolver: zodResolver(billSchema),
    defaultValues: {
      supplierId: "",
      supplierInvoiceNo: "",
      purchaseDate: todayInputValue(),
      poId: presetPoId ?? "",
      productId: "",
      vehicleNumber: "",
      grossWeight: 0,
      tareWeight: 0,
      ratePerKg: 0,
    },
  });

  const productId = watch("productId");
  const supplierId = watch("supplierId");
  const poId = watch("poId");
  const grossWeight = watch("grossWeight");
  const tareWeight = watch("tareWeight");
  const ratePerKg = watch("ratePerKg");

  const selectedProduct = products.find((item) => item.id === productId);
  const selectedPO = linkedPOs.find((order) => order.id === poId);

  const presetPOQuery = useQuery({
    queryKey: [...QUERY_KEYS.PURCHASE_ORDERS, presetPoId],
    queryFn: () => getPurchaseOrderById(presetPoId!),
    enabled: Boolean(presetPoId),
  });

  const stockQuery = useQuery({
    queryKey: [...QUERY_KEYS.STOCK, productId],
    queryFn: () => getStockByProduct(productId),
    enabled: Boolean(productId),
    retry: false,
  });

  const gstPercent = useMemo(() => {
    if (selectedProduct?.gstRate != null && Number(selectedProduct.gstRate) > 0) {
      return Number(selectedProduct.gstRate);
    }
    const fromMaster = gstRates.find(
      (rate) =>
        rate.category.toUpperCase().includes("RAW_MATERIAL") ||
        rate.applicableOn.toUpperCase().includes("RAW_MATERIAL") ||
        rate.applicableOn.toLowerCase().includes("purchase")
    );
    return fromMaster ? Number(fromMaster.gstPercent) : 0;
  }, [selectedProduct, gstRates]);

  const netWeight = Math.max(0, (grossWeight || 0) - (tareWeight || 0));
  const taxable = netWeight * (ratePerKg || 0);
  const gstAmount = taxable * (gstPercent / 100);
  const totalAmount = taxable + gstAmount;

  const currentStock = stockQuery.data?.data.quantity;
  const buyerDisplayName =
    selectedPO?.buyer?.name ??
    presetPOQuery.data?.data.buyer?.name ??
    null;

  useEffect(() => {
    if (presetPoId) {
      setValue("poId", presetPoId, { shouldValidate: true });
    }
  }, [presetPoId, setValue]);

  function buildPayload(values: BillFormValues): CreatePurchaseBillPayload {
    return {
      supplierId: values.supplierId,
      supplierInvoiceNo: values.supplierInvoiceNo.trim(),
      purchaseDate: toIsoDate(values.purchaseDate),
      poId: values.poId,
      productId: values.productId,
      vehicleNumber: values.vehicleNumber?.trim() || undefined,
      grossWeight: values.grossWeight,
      tareWeight: values.tareWeight,
      ratePerKg: values.ratePerKg,
    };
  }

  function invalidateAfterCreate() {
    void queryClient.invalidateQueries({
      queryKey: QUERY_KEYS.PURCHASE_BILLS,
    });
    void queryClient.invalidateQueries({
      queryKey: QUERY_KEYS.PURCHASE_ORDERS,
    });
  }

  const createBillMutation = useMutation({
    mutationFn: async (data: CreatePurchaseBillPayload) => {
      return createPurchaseBill(data);
    },
    onSuccess: (response) => {
      toast.success("Bill saved as draft.");
      invalidateAfterCreate();
      router.push(ROUTES.PURCHASE.DETAIL(response.data.id));
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to save bill."));
    },
  });

  const createAndConfirmMutation = useMutation({
    mutationFn: async (data: CreatePurchaseBillPayload) => {
      const bill = await createPurchaseBill(data);
      await confirmPurchaseBill(bill.data.id);
      return bill;
    },
    onSuccess: (response) => {
      toast.success("Bill confirmed. Stock updated.");
      invalidateAfterCreate();
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.STOCK });
      router.push(ROUTES.PURCHASE.DETAIL(response.data.id));
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to save bill."));
    },
  });

  const isSubmitting =
    createBillMutation.isPending || createAndConfirmMutation.isPending;

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-[28px]">
            New Purchase Bill
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Record incoming fabric lot. Stock will increase automatically once
            this bill is confirmed.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={!dropdownsReady || isSubmitting}
            onClick={handleSubmit((values) =>
              createBillMutation.mutate(buildPayload(values))
            )}
          >
            {createBillMutation.isPending ? "Saving..." : "Save as Draft"}
          </Button>
          <Button
            type="submit"
            form="new-bill-form"
            disabled={!dropdownsReady || isSubmitting}
            className="bg-[#1b3a3a] text-white hover:bg-[#1b3a3a]/90"
          >
            <Check className="size-4" />
            {createAndConfirmMutation.isPending
              ? "Saving..."
              : "Save & Confirm"}
          </Button>
        </div>
      </div>

      <form
        id="new-bill-form"
        onSubmit={handleSubmit((values) =>
          createAndConfirmMutation.mutate(buildPayload(values))
        )}
        className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:p-6"
      >
        <div className="grid gap-5 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Bill No
            </Label>
            <Input
              value="Auto-generated on save"
              readOnly
              disabled
              className="bg-slate-50"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Fabric Type
            </Label>
            <Select
              value={productId || undefined}
              onValueChange={(value) =>
                setValue("productId", value, { shouldValidate: true })
              }
              disabled={productsQuery.isLoading}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    productsQuery.isLoading ? "Loading..." : "Select fabric"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {products.map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.productId ? (
              <p className="text-sm text-destructive">
                {errors.productId.message}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Supplier Name
            </Label>
            <Select
              value={supplierId || undefined}
              onValueChange={(value) =>
                setValue("supplierId", value, { shouldValidate: true })
              }
              disabled={suppliersQuery.isLoading}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    suppliersQuery.isLoading
                      ? "Loading..."
                      : "Select supplier"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {suppliers.map((supplier) => (
                  <SelectItem key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.supplierId ? (
              <p className="text-sm text-destructive">
                {errors.supplierId.message}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Vehicle Number
            </Label>
            <Input placeholder="TN 37 AB 1234" {...register("vehicleNumber")} />
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Supplier&apos;s Invoice No
            </Label>
            <Input
              placeholder="e.g. INV/24/098"
              {...register("supplierInvoiceNo")}
            />
            {errors.supplierInvoiceNo ? (
              <p className="text-sm text-destructive">
                {errors.supplierInvoiceNo.message}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Weight Calculation
            </Label>
            <WeightCalculator
              grossWeight={grossWeight || 0}
              tareWeight={tareWeight || 0}
              onGrossChange={(value) =>
                setValue("grossWeight", value, { shouldValidate: true })
              }
              onTareChange={(value) =>
                setValue("tareWeight", value, { shouldValidate: true })
              }
              grossError={errors.grossWeight?.message}
              tareError={errors.tareWeight?.message}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Purchase Date
            </Label>
            <Input type="date" {...register("purchaseDate")} />
            {errors.purchaseDate ? (
              <p className="text-sm text-destructive">
                {errors.purchaseDate.message}
              </p>
            ) : null}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Linked PO
              </Label>
              <Select
                value={poId || undefined}
                onValueChange={(value) =>
                  setValue("poId", value, { shouldValidate: true })
                }
                disabled={
                  activePOsQuery.isLoading || inProductionPOsQuery.isLoading
                }
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      activePOsQuery.isLoading ||
                      inProductionPOsQuery.isLoading
                        ? "Loading..."
                        : "Select PO"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {linkedPOs.map((order) => (
                    <SelectItem key={order.id} value={order.id}>
                      {order.poNumber} — {order.buyer?.name ?? "Buyer"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {buyerDisplayName ? (
                <p className="text-xs text-muted-foreground">
                  Buyer: {buyerDisplayName}
                </p>
              ) : null}
              {errors.poId ? (
                <p className="text-sm text-destructive">{errors.poId.message}</p>
              ) : null}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-2">
                <Label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Rate per kg (₹)
                </Label>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  {...register("ratePerKg", { valueAsNumber: true })}
                />
                {errors.ratePerKg ? (
                  <p className="text-sm text-destructive">
                    {errors.ratePerKg.message}
                  </p>
                ) : null}
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  GST (%)
                </Label>
                <Input
                  value={
                    gstQuery.isLoading
                      ? "Loading..."
                      : `${gstPercent}%`
                  }
                  readOnly
                  disabled
                  className="bg-slate-50"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 border-t border-dashed border-slate-200 pt-5">
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="flex gap-3 rounded-lg border border-teal-100 bg-teal-50 px-4 py-3 text-sm text-teal-900">
              <Package className="mt-0.5 size-4 shrink-0 text-teal-700" />
              <div className="space-y-1">
                {productId ? (
                  <>
                    <p>
                      Current stock:{" "}
                      {stockQuery.isLoading
                        ? "Loading..."
                        : `${Number(currentStock ?? 0).toLocaleString("en-IN")} kg`}
                    </p>
                    {selectedProduct && netWeight > 0 ? (
                      <p>
                        {netWeight.toLocaleString("en-IN")} kg of{" "}
                        {selectedProduct.name} will be added to stock once this
                        bill is confirmed.
                      </p>
                    ) : (
                      <p>
                        Enter weights to see how much stock will be added.
                      </p>
                    )}
                  </>
                ) : (
                  <p>Select fabric type to see stock impact</p>
                )}
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Taxable Amount</span>
                <span className="font-medium">{formatCurrency(taxable)}</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  GST Amount ({gstPercent}%)
                </span>
                <span className="font-medium">{formatCurrency(gstAmount)}</span>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-3">
                <span className="font-semibold text-slate-900">
                  Total Payable
                </span>
                <span className="text-xl font-bold text-slate-900">
                  {formatCurrency(totalAmount)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <Button
          type="submit"
          disabled={!dropdownsReady || isSubmitting}
          className="mt-6 h-12 w-full bg-[#1b3a3a] text-base text-white hover:bg-[#1b3a3a]/90"
        >
          <Check className="size-4" />
          {createAndConfirmMutation.isPending
            ? "Saving..."
            : "Save & Confirm Bill"}
        </Button>
        <button
          type="button"
          disabled={!dropdownsReady || isSubmitting}
          onClick={handleSubmit((values) =>
            createBillMutation.mutate(buildPayload(values))
          )}
          className="mt-3 block w-full text-center text-sm font-medium text-[#1b3a3a] hover:underline disabled:opacity-50"
        >
          {createBillMutation.isPending
            ? "Saving..."
            : "Save as Draft (confirm later) →"}
        </button>
        {dropdownsLoading ? (
          <p className="mt-3 text-center text-sm text-muted-foreground">
            Loading form data...
          </p>
        ) : null}
      </form>
    </div>
  );
}
