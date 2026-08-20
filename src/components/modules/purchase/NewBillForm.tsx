"use client";

import { useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Check, Package } from "lucide-react";
import { toast } from "sonner";
import {
  calcBillAmounts,
  generateNextBillNumber,
  mockFabricProducts,
  mockPurchaseBills,
  mockSuppliers,
} from "@/mock/purchase";
import { mockPurchaseOrders } from "@/mock/purchaseOrders";
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
import { formatCurrency } from "@/lib/utils";

const billSchema = z
  .object({
    supplierId: z.string().min(1, "Supplier is required"),
    supplierInvoiceNo: z.string().min(1, "Supplier invoice number is required"),
    purchaseDate: z.string().min(1, "Purchase date is required"),
    poId: z.string().min(1, "Linked PO is required"),
    productId: z.string().min(1, "Fabric type is required"),
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

export function NewBillForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const billNumber = useMemo(
    () => generateNextBillNumber(mockPurchaseBills),
    []
  );

  const activePOs = useMemo(
    () =>
      mockPurchaseOrders.filter(
        (order) =>
          order.status === "ACTIVE" ||
          order.status === "IN_PRODUCTION" ||
          order.status === "READY_TO_SHIP"
      ),
    []
  );

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<BillFormValues>({
    resolver: zodResolver(billSchema),
    defaultValues: {
      supplierId: "supplier-luxe",
      supplierInvoiceNo: "",
      purchaseDate: "2023-10-25",
      poId: searchParams.get("poId") ?? activePOs[0]?.id ?? "",
      productId: "prod-cotton-240",
      vehicleNumber: "TN 37 AB 1234",
      grossWeight: 1050,
      tareWeight: 50,
      ratePerKg: 450,
    },
  });

  const productId = watch("productId");
  const supplierId = watch("supplierId");
  const poId = watch("poId");
  const grossWeight = watch("grossWeight");
  const tareWeight = watch("tareWeight");
  const ratePerKg = watch("ratePerKg");

  const selectedProduct = mockFabricProducts.find((item) => item.id === productId);
  const gstPercent = selectedProduct?.gstRate ?? 5;
  const netWeight = Math.max(0, (grossWeight || 0) - (tareWeight || 0));
  const amounts = calcBillAmounts(netWeight, ratePerKg || 0, gstPercent);

  useEffect(() => {
    const poFromQuery = searchParams.get("poId");
    if (poFromQuery) {
      setValue("poId", poFromQuery, { shouldValidate: true });
    }
  }, [searchParams, setValue]);

  function save(asDraft: boolean) {
    if (asDraft) {
      toast.success("Purchase bill saved as draft.");
    } else {
      toast.success("Purchase bill confirmed. Stock updated successfully.");
    }
    router.push(ROUTES.PURCHASE.BILLS);
  }

  function onValidSubmit() {
    save(false);
  }

  function onDraftClick() {
    // Draft still validates required fields lightly via form submit path optional
    toast.success("Purchase bill saved as draft.");
    router.push(ROUTES.PURCHASE.BILLS);
  }

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
          <Button type="button" variant="outline" onClick={onDraftClick}>
            Save as Draft
          </Button>
          <Button
            type="submit"
            form="new-bill-form"
            disabled={isSubmitting}
            className="bg-[#1b3a3a] text-white hover:bg-[#1b3a3a]/90"
          >
            <Check className="size-4" />
            Save & Confirm
          </Button>
        </div>
      </div>

      <form
        id="new-bill-form"
        onSubmit={handleSubmit(onValidSubmit)}
        className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:p-6"
      >
        <div className="grid gap-5 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Bill No
            </Label>
            <Input value={billNumber} readOnly disabled className="bg-slate-50" />
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Fabric Type
            </Label>
            <Select
              value={productId}
              onValueChange={(value) =>
                setValue("productId", value, { shouldValidate: true })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select fabric" />
              </SelectTrigger>
              <SelectContent>
                {mockFabricProducts.map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.productId ? (
              <p className="text-sm text-destructive">{errors.productId.message}</p>
            ) : null}
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Supplier Name
            </Label>
            <Select
              value={supplierId}
              onValueChange={(value) =>
                setValue("supplierId", value, { shouldValidate: true })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select supplier" />
              </SelectTrigger>
              <SelectContent>
                {mockSuppliers.map((supplier) => (
                  <SelectItem key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.supplierId ? (
              <p className="text-sm text-destructive">{errors.supplierId.message}</p>
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
                value={poId}
                onValueChange={(value) =>
                  setValue("poId", value, { shouldValidate: true })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select PO" />
                </SelectTrigger>
                <SelectContent>
                  {activePOs.map((order) => (
                    <SelectItem key={order.id} value={order.id}>
                      {order.poNumber} — {order.buyer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                <Input value={`${gstPercent}%`} readOnly disabled className="bg-slate-50" />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 border-t border-dashed border-slate-200 pt-5">
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="flex gap-3 rounded-lg border border-teal-100 bg-teal-50 px-4 py-3 text-sm text-teal-900">
              <Package className="mt-0.5 size-4 shrink-0 text-teal-700" />
              <p>
                {selectedProduct
                  ? `Net Weight of ${netWeight.toLocaleString("en-IN")} kg will be added to fabric stock for ${selectedProduct.name} once this bill is confirmed.`
                  : "Select fabric type to see stock impact"}
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Taxable Amount</span>
                <span className="font-medium">
                  {formatCurrency(amounts.taxable)}
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  GST Amount ({gstPercent}%)
                </span>
                <span className="font-medium">
                  {formatCurrency(amounts.gstAmount)}
                </span>
              </div>
              <div className="mt-3 border-t border-slate-200 pt-3 flex items-center justify-between">
                <span className="font-semibold text-slate-900">Total Payable</span>
                <span className="text-xl font-bold text-slate-900">
                  {formatCurrency(amounts.totalAmount)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="mt-6 h-12 w-full bg-[#1b3a3a] text-base text-white hover:bg-[#1b3a3a]/90"
        >
          <Check className="size-4" />
          Save & Confirm Bill
        </Button>
        <button
          type="button"
          onClick={onDraftClick}
          className="mt-3 block w-full text-center text-sm font-medium text-[#1b3a3a] hover:underline"
        >
          Save as Draft (confirm later) →
        </button>
      </form>
    </div>
  );
}
