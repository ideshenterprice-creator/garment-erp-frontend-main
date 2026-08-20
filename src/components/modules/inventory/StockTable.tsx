"use client";

import { History, SlidersHorizontal } from "lucide-react";
import type { MockStockItem } from "@/mock/inventory";
import { getUnitLabel } from "@/mock/inventory";
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
  items: MockStockItem[];
  onViewHistory: (item: MockStockItem) => void;
  onAdjust: (item: MockStockItem) => void;
  onAdd?: () => void;
}

export function StockTable({
  items,
  onViewHistory,
  onAdjust,
  onAdd,
}: StockTableProps) {
  if (items.length === 0) {
    return (
      <EmptyState
        title="No stock items found"
        description="Try changing filters or add a new stock entry."
        actionLabel="+ Add Entry"
        onAction={onAdd}
      />
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
              const isZero = item.quantity === 0;
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
                    {item.quantity.toLocaleString("en-IN")}
                  </TableCell>
                  <TableCell className="text-slate-600">
                    {getUnitLabel(item.product.unit)}
                  </TableCell>
                  <TableCell className="text-slate-600">
                    {item.lastUpdatedLabel}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-8 text-slate-500"
                        aria-label="View history"
                        onClick={() => onViewHistory(item)}
                      >
                        <History className="size-4" />
                      </Button>
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
