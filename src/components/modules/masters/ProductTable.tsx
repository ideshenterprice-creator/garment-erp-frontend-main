"use client";

import { Ban, Package, Pencil, Shirt, Trash2 } from "lucide-react";
import type { Product } from "@/types";
import { StatusBadge } from "@/components/common/StatusBadge";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ProductTableProps {
  products: Product[];
  onRowClick?: (product: Product) => void;
  onEdit: (product: Product) => void;
  onToggleStatus: (product: Product) => void;
  onDelete: (product: Product) => void;
  onAdd?: () => void;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyActionLabel?: string;
  onEmptyAction?: () => void;
  emptyActionIsClear?: boolean;
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

function categoryVariant(category: Product["category"]) {
  switch (category) {
    case "RAW_MATERIAL":
      return "raw_material" as const;
    case "FINISHED_GOOD":
      return "finished_good" as const;
    case "ACCESSORY":
      return "accessory" as const;
    case "WASTAGE":
      return "wastage" as const;
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

function ProductIcon({ category }: { category: Product["category"] }) {
  if (category === "FINISHED_GOOD") return <Shirt className="size-4" />;
  if (category === "ACCESSORY") return <Package className="size-4" />;
  if (category === "WASTAGE") return <Trash2 className="size-4" />;
  return <Package className="size-4" />;
}

export function ProductTable({
  products,
  onRowClick,
  onEdit,
  onToggleStatus,
  onDelete,
  onAdd,
  emptyTitle = "No products found",
  emptyDescription = "Try changing filters or add a new product.",
  emptyActionLabel = "New Product",
  onEmptyAction,
  emptyActionIsClear = false,
}: ProductTableProps) {
  if (products.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        actionLabel={emptyActionIsClear ? undefined : emptyActionLabel}
        onAction={emptyActionIsClear ? undefined : onEmptyAction ?? onAdd}
        actionButton={
          emptyActionIsClear && onEmptyAction ? (
            <Button
              type="button"
              variant="outline"
              className="mt-4"
              onClick={onEmptyAction}
            >
              Clear Filters
            </Button>
          ) : undefined
        }
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Product Name
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Category
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Unit
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                GST Rate
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Status
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow
                key={product.id}
                className={onRowClick ? "cursor-pointer" : undefined}
                onClick={() => onRowClick?.(product)}
              >
                <TableCell>
                  <div className="flex items-center gap-2 font-medium text-slate-900">
                    <span className="flex size-8 items-center justify-center rounded-md bg-slate-100 text-slate-600">
                      <ProductIcon category={product.category} />
                    </span>
                    {product.name}
                  </div>
                </TableCell>
                <TableCell>
                  <StatusBadge
                    label={categoryLabel(product.category)}
                    variant={categoryVariant(product.category)}
                  />
                </TableCell>
                <TableCell>{unitLabel(product.unit)}</TableCell>
                <TableCell>{Number(product.gstRate)}%</TableCell>
                <TableCell>
                  <StatusBadge
                    label={product.isActive ? "Active" : "Inactive"}
                    variant={product.isActive ? "active" : "inactive"}
                    withDot
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-0.5">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      onClick={(event) => {
                        event.stopPropagation();
                        onEdit(product);
                      }}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-8 text-red-500 hover:bg-red-50 hover:text-red-600"
                      title={product.isActive ? "Deactivate" : "Activate"}
                      onClick={(event) => {
                        event.stopPropagation();
                        onToggleStatus(product);
                      }}
                    >
                      <Ban className="size-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-8 text-red-500 hover:bg-red-50 hover:text-red-600"
                      title="Delete permanently"
                      onClick={(event) => {
                        event.stopPropagation();
                        onDelete(product);
                      }}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
