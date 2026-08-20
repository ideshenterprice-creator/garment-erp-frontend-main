"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Camera } from "lucide-react";
import { toast } from "sonner";
import type { ProductCategory, ProductUnit, SizeLabel } from "@/types";
import type { MockProduct } from "@/mock/masters";
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
import { cn } from "@/lib/utils";

const sizeOptions: { label: string; value: SizeLabel }[] = [
  { label: "0-3M", value: "SIZE_0_3M" },
  { label: "3-6M", value: "SIZE_3_6M" },
  { label: "6-9M", value: "SIZE_6_9M" },
  { label: "9-12M", value: "SIZE_9_12M" },
  { label: "12-18M", value: "SIZE_12_18M" },
  { label: "18-24M", value: "SIZE_18_24M" },
];

const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  category: z.enum(["RAW_MATERIAL", "FINISHED_GOOD", "ACCESSORY", "WASTAGE"]),
  unit: z.enum(["KG", "PCS", "METERS", "ROLLS"]),
  gstRate: z.number().min(0, "GST rate is required"),
  description: z.string().optional(),
  garmentType: z.string().optional(),
  sizes: z.array(z.string()).optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductDrawerProps {
  open: boolean;
  onClose: () => void;
  product?: MockProduct | null;
  onSave: (product: MockProduct) => void;
}

const defaultValues: ProductFormValues = {
  name: "",
  category: "FINISHED_GOOD",
  unit: "PCS",
  gstRate: 18,
  description: "",
  garmentType: "Top / T-Shirt",
  sizes: [],
};

export function ProductDrawer({
  open,
  onClose,
  product,
  onSave,
}: ProductDrawerProps) {
  const isEdit = Boolean(product);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues,
  });

  const category = watch("category");
  const unit = watch("unit");
  const sizes = watch("sizes") ?? [];

  useEffect(() => {
    if (!open) return;
    if (product) {
      reset({
        name: product.name,
        category: product.category,
        unit: product.unit,
        gstRate: product.gstRate,
        description: product.description,
        garmentType: product.garmentType ?? "Top / T-Shirt",
        sizes: product.sizes?.map((size) => size.sizeLabel) ?? [],
      });
    } else {
      reset(defaultValues);
    }
  }, [open, product, reset]);

  function toggleSize(size: SizeLabel) {
    const next = sizes.includes(size)
      ? sizes.filter((item) => item !== size)
      : [...sizes, size];
    setValue("sizes", next, { shouldValidate: true });
  }

  function onSubmit(values: ProductFormValues) {
    const next: MockProduct = {
      id: product?.id ?? `prod-${Date.now()}`,
      productCode: product?.productCode ?? `SKU-${Date.now().toString().slice(-4)}`,
      name: values.name,
      category: values.category as ProductCategory,
      unit: values.unit as ProductUnit,
      gstRate: values.gstRate,
      description: values.description ?? "",
      isActive: product?.isActive ?? true,
      displayStatus: product?.displayStatus ?? "ACTIVE",
      garmentType: values.garmentType,
      sizes:
        values.category === "FINISHED_GOOD"
          ? (values.sizes ?? []).map((sizeLabel, index) => ({
              id: `size-${index}`,
              productId: product?.id ?? "new",
              sizeLabel: sizeLabel as SizeLabel,
            }))
          : undefined,
    };

    onSave(next);
    toast.success(isEdit ? "Product updated successfully" : "Product saved successfully");
    onClose();
  }

  return (
    <DrawerForm
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Product" : "Add New Product"}
      description="Configure basic information and production rules."
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="product-form"
            disabled={isSubmitting}
            className="bg-[#1b3a3a] text-white hover:bg-[#1b3a3a]/90"
          >
            {isEdit ? "Update Product" : "Save Product"}
          </Button>
        </div>
      }
    >
      <form id="product-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        <div className="flex h-28 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 text-slate-500">
          <Camera className="mb-2 size-6" />
          <p className="text-sm">Upload Product Image</p>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="product-name">
            Product Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="product-name"
            placeholder="e.g. Kids Summer Jumper"
            {...register("name")}
          />
          {errors.name ? (
            <p className="text-sm text-destructive">{errors.name.message}</p>
          ) : null}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-2">
            <Label>
              Category <span className="text-red-500">*</span>
            </Label>
            <Select
              value={category}
              onValueChange={(value) =>
                setValue("category", value as ProductFormValues["category"], {
                  shouldValidate: true,
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="RAW_MATERIAL">Raw Material</SelectItem>
                <SelectItem value="FINISHED_GOOD">Finished Good</SelectItem>
                <SelectItem value="ACCESSORY">Accessory</SelectItem>
                <SelectItem value="WASTAGE">Wastage</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label>
              Unit of Measure <span className="text-red-500">*</span>
            </Label>
            <Select
              value={unit}
              onValueChange={(value) =>
                setValue("unit", value as ProductFormValues["unit"], {
                  shouldValidate: true,
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PCS">pcs</SelectItem>
                <SelectItem value="KG">kg</SelectItem>
                <SelectItem value="METERS">meters</SelectItem>
                <SelectItem value="ROLLS">rolls</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="gstRate">GST Rate %</Label>
          <Input
            id="gstRate"
            type="number"
            {...register("gstRate", { valueAsNumber: true })}
          />
          {errors.gstRate ? (
            <p className="text-sm text-destructive">{errors.gstRate.message}</p>
          ) : null}
        </div>

        {category === "FINISHED_GOOD" ? (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="mb-3 flex flex-col gap-2">
              <Label>Garment Type</Label>
              <Select
                value={watch("garmentType") ?? "Top / T-Shirt"}
                onValueChange={(value) => setValue("garmentType", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Top / T-Shirt">Top / T-Shirt</SelectItem>
                  <SelectItem value="Bodysuit">Bodysuit</SelectItem>
                  <SelectItem value="Romper">Romper</SelectItem>
                  <SelectItem value="Bottom">Bottom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-2 block">Size Range</Label>
              <div className="grid grid-cols-2 gap-2">
                {sizeOptions.map((option) => {
                  const checked = sizes.includes(option.value);
                  return (
                    <label
                      key={option.value}
                      className={cn(
                        "flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm",
                        checked
                          ? "border-[#1b3a3a] bg-white"
                          : "border-slate-200 bg-white"
                      )}
                    >
                      <input
                        type="checkbox"
                        className="size-4 accent-[#1b3a3a]"
                        checked={checked}
                        onChange={() => toggleSize(option.value)}
                      />
                      {option.label}
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        ) : null}

        <div className="flex flex-col gap-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            rows={4}
            placeholder="Add product details, washing instructions, or material composition..."
            {...register("description")}
          />
        </div>
      </form>
    </DrawerForm>
  );
}
