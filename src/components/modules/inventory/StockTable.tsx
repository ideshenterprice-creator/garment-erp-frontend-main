"use client";

import { format } from "date-fns";
import { SlidersHorizontal } from "lucide-react";
import type { Stock } from "@/types";
import { getUnitLabel } from "@/lib/inventory";
import { EmptyState } from "@/components/common/EmptyState";
import { StockCategoryBadge } from "@/components/modules/inventory/StockCategoryBadge";
import { StockStatusIndicator } from "@/components/modules/inventory/StockStatusIndicator";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface StockTableProps {
  items: Stock[];
  onAdjust: (item: Stock) => void;
  emptyTitle?: string;
  emptyDescription?: string;
}

export function StockTable({
  items,
  onAdjust,
  emptyTitle = "No stock items found",
  emptyDescription = "Try changing filters or confirm a purchase bill to add stock.",
}: StockTableProps) {
  if (items.length === 0) {
    return (
      <EmptyState title={emptyTitle} description={emptyDescription} />
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
              <TableHead className="w-8" />
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Product Name
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Category
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Available Stock
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Unit
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Last Updated
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => {
              const isZero =
                item.stockStatus === "OUT_OF_STOCK" ||
                Number(item.quantity) === 0;
              return (
                <TableRow
                  key={item.id}
                  className={cn(
                    "relative",
                    isZero && "bg-red-50 hover:bg-red-50/90"
                  )}
                >
                  <TableCell className="relative w-8 p-0">
                    <StockStatusIndicator
                      category={item.product.category}
                      isZeroStock={isZero}
                    />
                  </TableCell>
                  <TableCell
                    className={cn(
                      "font-semibold",
                      isZero ? "text-red-600" : "text-slate-900"
                    )}
                  >
                    {item.product.name}
                  </TableCell>
                  <TableCell>
                    <StockCategoryBadge category={item.product.category} />
                  </TableCell>
                  <TableCell
                    className={cn(
                      "font-semibold",
                      isZero ? "text-red-600" : "text-slate-900"
                    )}
                  >
                    {Number(item.quantity).toLocaleString("en-IN")}
                  </TableCell>
                  <TableCell className="text-slate-600">
                    {getUnitLabel(item.product.unit)}
                  </TableCell>
                  <TableCell className="text-slate-600">
                    {item.lastUpdated
                      ? format(new Date(item.lastUpdated), "dd MMM yyyy")
                      : "—"}
                  </TableCell>
                  <TableCell>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-8 text-slate-500"
                      aria-label="Adjust stock"
                      onClick={() => onAdjust(item)}
                    >
                      <SlidersHorizontal className="size-4" />
                    </Button>
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
