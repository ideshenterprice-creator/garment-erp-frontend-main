"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Send } from "lucide-react";
import { toast } from "sonner";
import type { CreateIssuePayload, IssueType } from "@/types";
import { BundleNumberDisplay } from "@/components/modules/inventory/BundleNumberDisplay";
import { StockAvailabilityBox } from "@/components/modules/inventory/StockAvailabilityBox";
import { StockValidationError } from "@/components/modules/inventory/StockValidationError";
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
import { getErrorMessage } from "@/lib/errorHandler";
import { getUnitLabel, ISSUE_TYPE_OPTIONS } from "@/lib/inventory";
import { cn } from "@/lib/utils";
import {
  createIssue,
  getStockByProduct,
} from "@/services/inventory.service";
import { getParties, getProducts } from "@/services/masters.service";
import {
  getPurchaseOrderById,
  getPurchaseOrders,
} from "@/services/purchaseOrders.service";

const issueSchema = z.object({
  issueDate: z.string().min(1, "Issue date is required"),
  issueType: z.enum([
    "CUTTING",
    "PRINTING",
    "STITCHING",
    "FINISHING",
    "SAMPLE",
    "PATTERN",
  ]),
  productId: z.string().uuid("Material is required"),
  poId: z.string().uuid("Linked PO is required"),
  poItemId: z.string().uuid("Linked design no is required"),
  karigarId: z.string().uuid("Issue to is required"),
  quantityIssued: z.number().positive("Quantity must be greater than 0"),
  notes: z.string().optional(),
});

type IssueFormValues = z.infer<typeof issueSchema>;

function todayInputValue(): string {
  return new Date().toISOString().slice(0, 10);
}

function toIsoDate(dateStr: string): string {
  return new Date(`${dateStr}T00:00:00.000Z`).toISOString();
}

export function IssueMaterialForm() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const karigarsQuery = useQuery({
    queryKey: [...QUERY_KEYS.PARTIES, { type: "KARIGAR", limit: 100 }],
    queryFn: () => getParties({ type: "KARIGAR", limit: 100 }),
  });

  const productsQuery = useQuery({
    queryKey: [...QUERY_KEYS.PRODUCTS, { limit: 100 }],
    queryFn: () => getProducts({ limit: 100 }),
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

  const linkedPOs = useMemo(() => {
    const active = activePOsQuery.data?.data.data ?? [];
    const inProduction = inProductionPOsQuery.data?.data.data ?? [];
    const byId = new Map(
      [...active, ...inProduction].map((order) => [order.id, order])
    );
    return Array.from(byId.values());
  }, [activePOsQuery.data, inProductionPOsQuery.data]);

  const products = (productsQuery.data?.data.data ?? []).filter(
    (product) => product.category !== "WASTAGE" && product.isActive
  );
  const karigars = karigarsQuery.data?.data.data ?? [];

  const dropdownsReady =
    karigarsQuery.isSuccess &&
    productsQuery.isSuccess &&
    activePOsQuery.isSuccess &&
    inProductionPOsQuery.isSuccess;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<IssueFormValues>({
    resolver: zodResolver(issueSchema),
    defaultValues: {
      issueDate: todayInputValue(),
      issueType: "CUTTING",
      productId: "",
      poId: "",
      poItemId: "",
      karigarId: "",
      quantityIssued: 0,
      notes: "",
    },
    mode: "onChange",
  });

  const productId = watch("productId");
  const poId = watch("poId");
  const quantityIssued = Number(watch("quantityIssued") || 0);

  const stockQuery = useQuery({
    queryKey: [...QUERY_KEYS.STOCK, productId],
    queryFn: () => getStockByProduct(productId),
    enabled: Boolean(productId),
    retry: false,
  });

  const poDetailQuery = useQuery({
    queryKey: [...QUERY_KEYS.PURCHASE_ORDERS, poId],
    queryFn: () => getPurchaseOrderById(poId),
    enabled: Boolean(poId),
  });

  const selectedProduct = products.find((item) => item.id === productId);
  const available = Number(stockQuery.data?.data.quantity ?? 0);
  const unit = getUnitLabel(selectedProduct?.unit ?? stockQuery.data?.data.product.unit);
  const stockExceeded =
    Boolean(productId) &&
    !stockQuery.isLoading &&
    quantityIssued > 0 &&
    quantityIssued > available;

  const designOptions = poDetailQuery.data?.data.items ?? [];

  useEffect(() => {
    if (!poId) {
      setValue("poItemId", "", { shouldValidate: false });
      return;
    }
    if (poDetailQuery.isLoading) return;
    const current = watch("poItemId");
    if (designOptions.length === 0) {
      setValue("poItemId", "", { shouldValidate: true });
      return;
    }
    if (!designOptions.some((item) => item.id === current)) {
      setValue("poItemId", designOptions[0].id, { shouldValidate: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sync design when PO items load
  }, [poId, designOptions, poDetailQuery.isLoading, setValue]);

  const createMutation = useMutation({
    mutationFn: (data: CreateIssuePayload) => createIssue(data),
    onSuccess: (response) => {
      const bundle =
        response.data.bundleNumber ??
        response.data.bundles?.[0]?.bundleNumber ??
        "—";
      toast.success(`Material issued. Bundle ${bundle} created.`);
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.STOCK });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ISSUES });
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.PURCHASE_ORDERS,
      });
      router.push(ROUTES.INVENTORY.ISSUE_HISTORY);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to issue material."));
    },
  });

  function onSubmit(values: IssueFormValues) {
    if (values.quantityIssued > available) return;
    createMutation.mutate({
      issueDate: toIsoDate(values.issueDate),
      issueType: values.issueType as IssueType,
      productId: values.productId,
      poId: values.poId,
      poItemId: values.poItemId,
      karigarId: values.karigarId,
      quantityIssued: values.quantityIssued,
      notes: values.notes?.trim() || undefined,
    });
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:p-6"
    >
      <div className="grid gap-5 md:grid-cols-2">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <Label htmlFor="issueNumber">Issue No</Label>
            <Input
              id="issueNumber"
              value="Auto-generated"
              readOnly
              className="bg-slate-50 text-slate-700"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="issueDate">
              Issue Date <span className="text-red-500">*</span>
            </Label>
            <Input id="issueDate" type="date" {...register("issueDate")} />
            {errors.issueDate ? (
              <p className="text-sm text-destructive">
                {errors.issueDate.message}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-2">
            <Label>
              Issue Type <span className="text-red-500">*</span>
            </Label>
            <Select
              value={watch("issueType")}
              onValueChange={(value) =>
                setValue("issueType", value as IssueType, {
                  shouldValidate: true,
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select issue type" />
              </SelectTrigger>
              <SelectContent>
                {ISSUE_TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.issueType ? (
              <p className="text-sm text-destructive">
                {errors.issueType.message}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-2">
            <Label>
              Linked PO <span className="text-red-500">*</span>
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
                    activePOsQuery.isLoading || inProductionPOsQuery.isLoading
                      ? "Loading..."
                      : "Select PO"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {linkedPOs.map((po) => (
                  <SelectItem key={po.id} value={po.id}>
                    {po.poNumber} — {po.buyer?.name ?? "Buyer"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.poId ? (
              <p className="text-sm text-destructive">{errors.poId.message}</p>
            ) : null}
          </div>

          <div className="flex flex-col gap-2">
            <Label>
              Linked Design No <span className="text-red-500">*</span>
            </Label>
            <Select
              value={watch("poItemId") || undefined}
              onValueChange={(value) =>
                setValue("poItemId", value, { shouldValidate: true })
              }
              disabled={!poId || poDetailQuery.isLoading || designOptions.length === 0}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    !poId
                      ? "Select PO first"
                      : poDetailQuery.isLoading
                        ? "Loading..."
                        : "Select design"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {designOptions.map((design) => (
                  <SelectItem key={design.id} value={design.id}>
                    {design.designNumber}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.poItemId ? (
              <p className="text-sm text-destructive">
                {errors.poItemId.message}
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <Label>
              Issue To <span className="text-red-500">*</span>
            </Label>
            <Select
              value={watch("karigarId") || undefined}
              onValueChange={(value) =>
                setValue("karigarId", value, { shouldValidate: true })
              }
              disabled={karigarsQuery.isLoading}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    karigarsQuery.isLoading ? "Loading..." : "Select karigar"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {karigars.map((party) => (
                  <SelectItem key={party.id} value={party.id}>
                    {party.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.karigarId ? (
              <p className="text-sm text-destructive">
                {errors.karigarId.message}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-2">
            <Label>
              Material <span className="text-red-500">*</span>
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
                    productsQuery.isLoading ? "Loading..." : "Select material"
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
            <Label htmlFor="quantityIssued">
              Quantity to Issue ({unit}) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="quantityIssued"
              type="number"
              step="any"
              className={cn(
                stockExceeded && "border-red-500 focus-visible:ring-red-500"
              )}
              {...register("quantityIssued", { valueAsNumber: true })}
            />
            {productId ? (
              stockQuery.isLoading ? (
                <p className="text-sm text-teal-700">Checking stock...</p>
              ) : stockQuery.isError ? (
                <p className="text-sm text-destructive">
                  No stock record for this product.
                </p>
              ) : (
                <StockAvailabilityBox available={available} unit={unit} />
              )
            ) : null}
            {errors.quantityIssued ? (
              <p className="text-sm text-destructive">
                {errors.quantityIssued.message}
              </p>
            ) : null}
          </div>

          <BundleNumberDisplay bundleNumber="Auto-generated" />

          <div className="flex flex-col gap-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              rows={3}
              placeholder="Add specific Instructions for the Karigar..."
              {...register("notes")}
            />
          </div>
        </div>
      </div>

      {stockExceeded ? (
        <div className="mt-5">
          <StockValidationError
            available={available}
            entered={quantityIssued}
            unit={unit}
          />
        </div>
      ) : null}

      <div className="mt-6">
        <Button
          type="submit"
          disabled={
            createMutation.isPending ||
            stockExceeded ||
            !dropdownsReady ||
            (Boolean(productId) && stockQuery.isError)
          }
          className="w-full bg-[#1b3a3a] text-white hover:bg-[#1b3a3a]/90"
        >
          <Send className="size-4" />
          {createMutation.isPending ? "Issuing..." : "Issue Material"}
        </Button>
        <p className="mt-2 text-center text-xs text-muted-foreground">
          Stock reduces immediately on save.
        </p>
      </div>
    </form>
  );
}
