"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Ban, Plus, Save } from "lucide-react";
import { toast } from "sonner";
import { mockPurchaseOrders } from "@/mock/purchaseOrders";
import {
  generateNextInvoiceNumber,
  getStockForItem,
  mockSalesBills,
  poItemsToBillDraftItems,
  salesContainers,
} from "@/mock/sales";
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
import { ROUTES } from "@/constants/routes";

const formSchema = z.object({
  poId: z.string().min(1, "PO is required"),
  invoiceDate: z.string().min(1, "Invoice date is required"),
  containerNo: z.string().optional(),
  currency: z.string().min(1),
  exchangeRate: z.number().positive(),
  buyerPoReference: z.string().optional(),
  paymentTerms: z.string().optional(),
  shippingDestination: z.string().optional(),
  buyerName: z.string().optional(),
  internalNote: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function NewSalesBillForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const invoiceNumber = useMemo(
    () => generateNextInvoiceNumber(mockSalesBills),
    []
  );
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
      invoiceDate: "",
      containerNo: "",
      currency: "USD",
      exchangeRate: 83.14,
      buyerPoReference: "",
      paymentTerms: "",
      shippingDestination: "",
      buyerName: "",
      internalNote:
        "Export clearance pending shipment verification from port. Check container seal before final submit.",
    },
  });

  const poId = watch("poId");
  const currency = watch("currency");

  const subTotal = items.reduce(
    (sum, item) => sum + item.quantity * item.ratePerPiece,
    0
  );
  const hasStockError = items.some(
    (item) => item.quantity > 0 && item.quantity > item.availableStock
  );
  const hasInvalidItems =
    items.length === 0 ||
    items.some((item) => item.quantity <= 0 || item.ratePerPiece <= 0);

  useEffect(() => {
    const preset = searchParams.get("poId");
    if (preset) {
      setValue("poId", preset);
    }
  }, [searchParams, setValue]);

  useEffect(() => {
    if (!poId) {
      setItems([]);
      return;
    }
    const order = mockPurchaseOrders.find((po) => po.id === poId);
    if (!order) return;

    setValue("buyerName", order.buyer.name);
    setValue("buyerPoReference", order.buyerPoReference);
    setValue("paymentTerms", order.paymentTerms);
    setValue("shippingDestination", order.shippingDestination);

    const draft = poItemsToBillDraftItems(poId);
    setItems(
      draft.slice(0, 6).map((row, index) => ({
        id: `row-${index}`,
        designNumber: row.designNumber,
        garmentType: row.garmentType,
        color: row.color,
        size: row.size,
        quantity: index < 2 ? 200 : index === 2 ? 100 : 0,
        ratePerPiece: index < 2 ? 80 : index === 2 ? 90 : 0,
        availableStock: getStockForItem(row.designNumber, row.color, row.size),
      }))
    );
  }, [poId, setValue]);

  function saveDraft() {
    toast.success("Bill saved as draft.");
    router.push(ROUTES.SALES.BILLS);
  }

  function onSubmitValid() {
    if (hasStockError || hasInvalidItems) return;
    setSubmitOpen(true);
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
          <Button type="button" variant="outline" onClick={saveDraft}>
            <Save className="size-4" />
            Save as Draft
          </Button>
          <Button
            type="button"
            disabled={hasStockError || hasInvalidItems}
            className="bg-[#1b3a3a] text-white hover:bg-[#1b3a3a]/90 disabled:opacity-50"
            onClick={handleSubmit(onSubmitValid)}
            title={
              hasStockError
                ? "Fix stock errors before submitting"
                : undefined
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
              <Input value={invoiceNumber} readOnly className="bg-slate-50" />
            </div>
            <div className="flex flex-col gap-2">
              <Label>PO Number</Label>
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
                  {mockPurchaseOrders.map((po) => (
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
              <Label>Buyer PO Reference</Label>
              <Input readOnly className="bg-slate-50" {...register("buyerPoReference")} />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Buyer</Label>
              <Input readOnly className="bg-slate-50" {...register("buyerName")} />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Payment Terms</Label>
              <Input readOnly className="bg-slate-50" {...register("paymentTerms")} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="invoiceDate">Invoice Date</Label>
              <Input id="invoiceDate" type="date" {...register("invoiceDate")} />
              {errors.invoiceDate ? (
                <p className="text-sm text-destructive">
                  {errors.invoiceDate.message}
                </p>
              ) : null}
            </div>
            <div className="flex flex-col gap-2">
              <Label>Container No</Label>
              <Select
                value={watch("containerNo")}
                onValueChange={(value) => setValue("containerNo", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select container" />
                </SelectTrigger>
                <SelectContent>
                  {salesContainers.map((ctn) => (
                    <SelectItem key={ctn.id} value={ctn.containerNumber}>
                      {ctn.containerNumber}
                    </SelectItem>
                  ))}
                  <SelectItem value="MSCU-99210-4">MSCU-99210-4</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label>Currency</Label>
              <Select
                value={currency}
                onValueChange={(value) => setValue("currency", value)}
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
                className="bg-slate-50"
                {...register("shippingDestination")}
              />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">Bill Items</h2>
            <Button type="button" variant="ghost" className="text-teal-700">
              <Plus className="size-4" />
              Add Item
            </Button>
          </div>

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

          <div className="mt-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="rounded-lg bg-slate-50 px-3 py-3 text-sm max-w-md">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Internal Note
              </p>
              <p className="mt-1 text-slate-600">{watch("internalNote")}</p>
            </div>
            <BillTotalsSection subTotal={subTotal} netTotal={subTotal} />
          </div>
        </div>
      </form>

      <SubmitBillDialog
        open={submitOpen}
        onClose={() => setSubmitOpen(false)}
        onConfirm={() => {
          toast.success("Bill submitted successfully.");
          router.push(ROUTES.SALES.BILLS);
        }}
      />
    </div>
  );
}
