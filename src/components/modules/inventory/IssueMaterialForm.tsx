"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Send } from "lucide-react";
import { toast } from "sonner";
import {
  generateNextBundleNumber,
  generateNextIssueNumber,
  getUnitLabel,
  ISSUE_TYPE_OPTIONS,
  mockIssueRecords,
  mockKarigarParties,
  mockLinkedPOOptions,
  mockStockItems,
} from "@/mock/inventory";
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
import { cn } from "@/lib/utils";

const issueSchema = z
  .object({
    issueDate: z.string().min(1, "Issue date is required"),
    issueType: z.string().min(1, "Issue type is required"),
    productId: z.string().min(1, "Material is required"),
    poId: z.string().min(1, "Linked PO is required"),
    poItemId: z.string().min(1, "Linked design no is required"),
    karigarId: z.string().min(1, "Issue to is required"),
    quantityIssued: z.number().positive("Quantity must be greater than 0"),
    notes: z.string().optional(),
  })
  .superRefine((values, ctx) => {
    const stock = mockStockItems.find((item) => item.productId === values.productId);
    if (stock && values.quantityIssued > stock.quantity) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["quantityIssued"],
        message: `Insufficient stock. Available: ${stock.quantity.toLocaleString("en-IN")}.`,
      });
    }
  });

type IssueFormValues = z.infer<typeof issueSchema>;

export function IssueMaterialForm() {
  const router = useRouter();
  const issueNumber = useMemo(
    () => generateNextIssueNumber(mockIssueRecords),
    []
  );
  const bundleNumber = useMemo(
    () => generateNextBundleNumber(mockIssueRecords),
    []
  );

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<IssueFormValues>({
    resolver: zodResolver(issueSchema),
    defaultValues: {
      issueDate: "2024-04-15",
      issueType: "CUTTING",
      productId: "prod-poplin",
      poId: "po-summer",
      poItemId: "poi-floral",
      karigarId: "k-abdul",
      quantityIssued: 2000,
      notes: "",
    },
    mode: "onChange",
  });

  const productId = watch("productId");
  const poId = watch("poId");
  const quantityIssued = Number(watch("quantityIssued") || 0);

  const selectedStock = useMemo(
    () => mockStockItems.find((item) => item.productId === productId),
    [productId]
  );

  const available = selectedStock?.quantity ?? 0;
  const unit = selectedStock
    ? getUnitLabel(selectedStock.product.unit)
    : "kg";
  const stockExceeded =
    Boolean(productId) && quantityIssued > 0 && quantityIssued > available;

  const designOptions = useMemo(() => {
    const po = mockLinkedPOOptions.find((item) => item.id === poId);
    return po?.designs ?? [];
  }, [poId]);

  useEffect(() => {
    if (designOptions.length === 0) {
      setValue("poItemId", "", { shouldValidate: true });
      return;
    }
    const current = watch("poItemId");
    if (!designOptions.some((item) => item.id === current)) {
      setValue("poItemId", designOptions[0].id, { shouldValidate: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sync design when PO changes
  }, [designOptions, setValue]);

  const [issuedOnce, setIssuedOnce] = useState(false);

  function onSubmit(values: IssueFormValues) {
    if (values.quantityIssued > available) return;
    setIssuedOnce(true);
    toast.success(
      `Material issued successfully. Bundle ${bundleNumber} created.`
    );
    router.push(ROUTES.INVENTORY.ISSUE_HISTORY);
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
              value={issueNumber}
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
              <p className="text-sm text-destructive">{errors.issueDate.message}</p>
            ) : null}
          </div>

          <div className="flex flex-col gap-2">
            <Label>
              Issue Type <span className="text-red-500">*</span>
            </Label>
            <Select
              value={watch("issueType")}
              onValueChange={(value) =>
                setValue("issueType", value, { shouldValidate: true })
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
              <p className="text-sm text-destructive">{errors.issueType.message}</p>
            ) : null}
          </div>

          <div className="flex flex-col gap-2">
            <Label>
              Linked PO <span className="text-red-500">*</span>
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
                {mockLinkedPOOptions.map((po) => (
                  <SelectItem key={po.id} value={po.id}>
                    {po.label}
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
              value={watch("poItemId")}
              onValueChange={(value) =>
                setValue("poItemId", value, { shouldValidate: true })
              }
              disabled={designOptions.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select design" />
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
              <p className="text-sm text-destructive">{errors.poItemId.message}</p>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <Label>
              Issue To <span className="text-red-500">*</span>
            </Label>
            <Select
              value={watch("karigarId")}
              onValueChange={(value) =>
                setValue("karigarId", value, { shouldValidate: true })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select karigar" />
              </SelectTrigger>
              <SelectContent>
                {mockKarigarParties.map((party) => (
                  <SelectItem key={party.id} value={party.id}>
                    {party.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.karigarId ? (
              <p className="text-sm text-destructive">{errors.karigarId.message}</p>
            ) : null}
          </div>

          <div className="flex flex-col gap-2">
            <Label>
              Material <span className="text-red-500">*</span>
            </Label>
            <Select
              value={productId}
              onValueChange={(value) =>
                setValue("productId", value, { shouldValidate: true })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select material" />
              </SelectTrigger>
              <SelectContent>
                {mockStockItems
                  .filter((item) => item.product.category !== "WASTAGE")
                  .map((item) => (
                    <SelectItem key={item.productId} value={item.productId}>
                      {item.product.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            {selectedStock ? (
              <StockAvailabilityBox available={available} unit={unit} />
            ) : null}
            {errors.productId ? (
              <p className="text-sm text-destructive">{errors.productId.message}</p>
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
            {errors.quantityIssued ? (
              <p className="text-sm text-destructive">
                {errors.quantityIssued.message}
              </p>
            ) : null}
          </div>

          <BundleNumberDisplay bundleNumber={bundleNumber} />

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
          disabled={isSubmitting || stockExceeded || issuedOnce}
          className="w-full bg-[#1b3a3a] text-white hover:bg-[#1b3a3a]/90"
        >
          <Send className="size-4" />
          Issue Material
        </Button>
        <p className="mt-2 text-center text-xs text-muted-foreground">
          Stock reduces immediately on save.
        </p>
      </div>
    </form>
  );
}
