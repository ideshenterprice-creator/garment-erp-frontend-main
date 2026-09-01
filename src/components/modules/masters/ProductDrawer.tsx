"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Camera } from "lucide-react";
import { toast } from "sonner";
import type { CreateProductPayload, Product, SizeLabel } from "@/types";
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
import { getErrorMessage } from "@/lib/errorHandler";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { createProduct, updateProduct } from "@/services/masters.service";

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
  sizes: z.array(z.string()).optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductDrawerProps {
  open: boolean;
  onClose: () => void;
  product?: Product | null;
}

const defaultValues: ProductFormValues = {
  name: "",
  category: "FINISHED_GOOD",
  unit: "PCS",
  gstRate: 18,
  description: "",
  sizes: [],
};

export function ProductDrawer({ open, onClose, product }: ProductDrawerProps) {
  const isEdit = Boolean(product);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
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
        gstRate: Number(product.gstRate),
        description: product.description ?? "",
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

  const addProductMutation = useMutation({
    mutationFn: (data: CreateProductPayload) => createProduct(data),
    onSuccess: () => {
      toast.success("Product added successfully.");
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PRODUCTS });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.NOTIFICATIONS });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.STOCK });
      onClose();
      reset(defaultValues);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to add product."));
    },
  });

  const editProductMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<CreateProductPayload>;
    }) => updateProduct(id, data),
    onSuccess: () => {
      toast.success("Product updated.");
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PRODUCTS });
      if (product?.id) {
        void queryClient.invalidateQueries({
          queryKey: [...QUERY_KEYS.PRODUCTS, product.id],
        });
      }
      onClose();
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to update product."));
    },
  });

  const isPending =
    addProductMutation.isPending || editProductMutation.isPending;

  function onSubmit(values: ProductFormValues) {
    const payload: CreateProductPayload = {
      name: values.name,
      category: values.category,
      unit: values.unit,
      gstRate: values.gstRate,
      description: values.description || undefined,
      ...(values.category === "FINISHED_GOOD"
        ? { sizes: (values.sizes ?? []) as SizeLabel[] }
        : {}),
    };

    if (isEdit && product) {
      editProductMutation.mutate({ id: product.id, data: payload });
      return;
    }
    addProductMutation.mutate(payload);
  }

  return (
    <DrawerForm
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Product" : "Add New Product"}
      description="Configure basic information and production rules."
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="product-form"
            disabled={isPending}
            className="bg-[#1b3a3a] text-white hover:bg-[#1b3a3a]/90"
          >
            {isPending
              ? "Saving..."
              : isEdit
                ? "Update Product"
                : "Save Product"}
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
