"use client";

import { Pencil, X } from "lucide-react";
import { format } from "date-fns";
import type { PurchaseOrder, PurchaseOrderStatus } from "@/types";
import { EmptyState } from "@/components/common/EmptyState";
import { POStatusBadge } from "@/components/modules/purchase-orders/POStatusBadge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface POTableProps {
  orders: PurchaseOrder[];
  onRowClick: (order: PurchaseOrder) => void;
  onEdit: (order: PurchaseOrder) => void;
  onCancel: (order: PurchaseOrder) => void;
  onAdd?: () => void;
}

function canCancel(status: PurchaseOrderStatus): boolean {
  return status !== "COMPLETED" && status !== "CANCELLED";
}

export function POTable({
  orders,
  onRowClick,
  onEdit,
  onCancel,
  onAdd,
}: POTableProps) {
  if (orders.length === 0) {
    return (
      <EmptyState
        title="No purchase orders found"
        description="Try changing filters or create a new purchase order."
        actionLabel="New PO"
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
                PO Number
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Buyer Name
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Order Date
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Delivery Date
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Total Pieces
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Designs
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
            {orders.map((order) => (
              <TableRow
                key={order.id}
                className="cursor-pointer"
                onClick={() => onRowClick(order)}
              >
                <TableCell className="font-semibold text-slate-900">
                  {order.poNumber}
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium text-slate-900">{order.buyer.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {order.buyer.city}
                      {order.buyer.country ? `, ${order.buyer.country}` : ""}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  {format(new Date(order.orderDate), "dd MMM yyyy")}
                </TableCell>
                <TableCell>
                  {format(new Date(order.deliveryDate), "dd MMM yyyy")}
                </TableCell>
                <TableCell className="font-semibold">
                  {order.totalPieces.toLocaleString("en-IN")}
                </TableCell>
                <TableCell>{order.totalDesigns}</TableCell>
                <TableCell>
                  <POStatusBadge status={order.status} />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-8 text-slate-500"
                      disabled={!canCancel(order.status)}
                      onClick={(event) => {
                        event.stopPropagation();
                        onEdit(order);
                      }}
                      aria-label="Edit PO"
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className={`size-8 ${
                        canCancel(order.status)
                          ? "text-red-500 hover:text-red-600"
                          : "text-slate-300"
                      }`}
                      disabled={!canCancel(order.status)}
                      onClick={(event) => {
                        event.stopPropagation();
                        onCancel(order);
                      }}
                      aria-label="Cancel PO"
                    >
                      <X className="size-4" />
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
