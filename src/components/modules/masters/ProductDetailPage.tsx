"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Info, Package, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { Product } from "@/types";
import { StatusBadge } from "@/components/common/StatusBadge";
import {
  ConfirmDialog,
  PERMANENT_DELETE,
} from "@/components/common/ConfirmDialog";
import { ProductDrawer } from "@/components/modules/masters/ProductDrawer";
import { Button } from "@/components/ui/button";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { ROUTES } from "@/constants/routes";
import { getErrorMessage } from "@/lib/errorHandler";
import { deleteProduct } from "@/services/masters.service";

interface ProductDetailPageProps {
  product: Product;
}

function categoryLabel(category: Product["category"]) {
  switch (category) {
    case "RAW_MATERIAL":
      return "Raw Material";
    case "FINISHED_GOOD":
      return "Finished Goods";
    case "ACCESSORY":
      return "Accessory";
    case "WASTAGE":
      return "Wastage";
  }
}

function unitLabel(unit: Product["unit"]) {
  switch (unit) {
    case "KG":
      return "Kgs";
    case "PCS":
      return "Pcs";
    case "METERS":
      return "Meters";
    case "ROLLS":
      return "Rolls";
  }
}

function sizeLabel(size: string) {
  return size.replace("SIZE_", "").replaceAll("_", "-");
}

export function ProductDetailPage({ product }: ProductDetailPageProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: () => {
      toast.success("Product deleted permanently.");
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PRODUCTS });
      router.push(ROUTES.MASTERS.PRODUCT);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to delete product."));
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={() => router.push(ROUTES.MASTERS.PRODUCT)}
            className="mt-1 rounded-md p-1 text-slate-500 hover:bg-slate-100"
            aria-label="Back"
          >
            <ArrowLeft className="size-5" />
          </button>
          <div>
            <div className="flex flex-wrap items-center gap-3">
              {product.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={product.imageUrl}
                  alt=""
                  className="size-14 rounded-lg border border-slate-200 object-cover"
                />
              ) : null}
              <h1 className="text-2xl font-bold text-slate-900 md:text-[28px]">
                {product.name}
              </h1>
              <StatusBadge
                label={product.isActive ? "Active" : "Inactive"}
                variant={product.isActive ? "active" : "inactive"}
                withDot
              />
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {categoryLabel(product.category)} · {product.productCode}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={() => setEditOpen(true)}>
            <Pencil className="size-4" />
            Edit Product
          </Button>
          <Button
            type="button"
            variant="outline"
            className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
            onClick={() => setDeleteOpen(true)}
            disabled={deleteMutation.isPending}
          >
            <Trash2 className="size-4" />
            Delete Product
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Info className="size-4 text-slate-500" />
            <h2 className="font-semibold text-slate-900">Product Info</h2>
          </div>
          {product.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.imageUrl}
              alt={product.name}
              className="mb-4 h-48 w-full rounded-lg border border-slate-100 object-cover"
            />
          ) : (
            <div className="mb-4 flex h-48 w-full items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-400">
              No product image yet. Use Edit Product to upload one.
            </div>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                Category
              </p>
              <p className="mt-1 text-sm font-medium">
                {categoryLabel(product.category)}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                Unit
              </p>
              <p className="mt-1 text-sm font-medium">
                {unitLabel(product.unit)}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                GST Rate
              </p>
              <p className="mt-1 text-sm font-medium">
                {Number(product.gstRate)}%
              </p>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                Product Code
              </p>
              <p className="mt-1 text-sm font-medium">{product.productCode}</p>
            </div>
            {product.description ? (
              <div className="sm:col-span-2">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Description
                </p>
                <p className="mt-1 text-sm font-medium">{product.description}</p>
              </div>
            ) : null}
            {product.sizes && product.sizes.length > 0 ? (
              <div className="sm:col-span-2">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Sizes
                </p>
                <div className="flex flex-wrap gap-1">
                  {product.sizes.map((size) => (
                    <span
                      key={size.id}
                      className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700"
                    >
                      {sizeLabel(size.sizeLabel)}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <Package className="mb-3 size-10 text-slate-400" />
          <p className="text-sm text-muted-foreground">
            Stock levels for this product are tracked in Inventory → Stock View.
          </p>
          <Button
            type="button"
            variant="outline"
            className="mt-4"
            onClick={() => router.push(ROUTES.INVENTORY.STOCK)}
          >
            Open Stock View
          </Button>
        </div>
      </div>

      <ProductDrawer
        open={editOpen}
        onClose={() => setEditOpen(false)}
        product={product}
      />

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => {
          if (!deleteMutation.isPending) setDeleteOpen(false);
        }}
        {...PERMANENT_DELETE}
        description={`${PERMANENT_DELETE.description} ${product.name} will be deleted.`}
        onConfirm={() => deleteMutation.mutate(product.id)}
      />
    </div>
  );
}
