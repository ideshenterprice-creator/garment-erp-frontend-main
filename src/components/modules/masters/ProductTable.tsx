"use client";

import { Package, Pencil, Shirt, Trash2 } from "lucide-react";
import type { MockProduct } from "@/mock/masters";
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
  products: MockProduct[];
  onRowClick?: (product: MockProduct) => void;
  onEdit: (product: MockProduct) => void;
  onDelete: (product: MockProduct) => void;
  onAdd?: () => void;
}

function categoryLabel(category: MockProduct["category"]) {
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

function categoryVariant(category: MockProduct["category"]) {
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

function unitLabel(unit: MockProduct["unit"]) {
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

function statusMeta(status: MockProduct["displayStatus"]) {
  if (status === "ACTIVE") {
    return { label: "Active", variant: "active" as const };
  }
  if (status === "DISCONTINUED") {
    return { label: "Discontinued", variant: "discontinued" as const };
  }
  return { label: "Tracking", variant: "tracking" as const };
}

function ProductIcon({ category }: { category: MockProduct["category"] }) {
  if (category === "FINISHED_GOOD") return <Shirt className="size-4" />;
  if (category === "ACCESSORY") return <Package className="size-4" />;
  if (category === "WASTAGE") return <Trash2 className="size-4" />;
  return <Package className="size-4" />;
}

export function ProductTable({
  products,
  onRowClick,
  onEdit,
  onDelete,
  onAdd,
}: ProductTableProps) {
  if (products.length === 0) {
    return (
      <EmptyState
        title="No products found"
        description="Try changing filters or add a new product."
        actionLabel="New Product"
        onAction={onAdd}
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
            {products.map((product) => {
              const status = statusMeta(product.displayStatus);
              return (
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
                  <TableCell>{product.gstRate}%</TableCell>
                  <TableCell>
                    <StatusBadge
                      label={status.label}
                      variant={status.variant}
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
                        className="size-8 text-red-500 hover:bg-red-50"
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
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
