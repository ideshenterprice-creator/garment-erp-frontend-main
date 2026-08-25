"use client";

import Link from "next/link";
import { ClipboardList, Info } from "lucide-react";
import { format } from "date-fns";
import type { PurchaseOrder } from "@/types";
import { ROUTES } from "@/constants/routes";
import { getDeliveryDateClassName } from "@/lib/purchaseOrders";
import { cn } from "@/lib/utils";

interface PODetailCardProps {
  order: PurchaseOrder;
}

export function PODetailCard({ order }: PODetailCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <Info className="size-4 text-slate-500" />
        <h2 className="font-semibold text-slate-900">Order Summary</h2>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Buyer
          </p>
          <Link
            href={`/masters/party/${order.buyerId}`}
            className="mt-1 inline-block text-sm font-medium text-[#1b3a3a] hover:underline"
          >
            {order.buyer.name}
          </Link>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Ref No
          </p>
          <p className="mt-1 text-sm font-medium text-slate-900">
            {order.buyerPoReference}
          </p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Order Date
          </p>
          <p className="mt-1 text-sm font-medium text-slate-900">
            {format(new Date(order.orderDate), "dd MMM yyyy")}
          </p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Delivery Date
          </p>
          <p
            className={cn(
              "mt-1 text-sm font-medium",
              getDeliveryDateClassName(order.deliveryDate, order.status)
            )}
          >
            {format(new Date(order.deliveryDate), "dd MMM yyyy")}
          </p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Destination
          </p>
          <p className="mt-1 text-sm font-medium text-slate-900">
            {order.shippingDestination}
          </p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Terms
          </p>
          <p className="mt-1 text-sm font-medium text-slate-900">
            {order.paymentTerms}
          </p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Total Pieces
          </p>
          <p className="mt-1 text-sm font-medium text-slate-900">
            {Number(order.totalPieces).toLocaleString("en-IN")}
          </p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Total Designs
          </p>
          <p className="mt-1 text-sm font-medium text-slate-900">
            {order.totalDesigns} Designs
          </p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Linked Modules
          </p>
          <div className="mt-1 flex flex-wrap gap-2 text-sm font-medium">
            <Link
              href={ROUTES.PRODUCTION.ROOT}
              className="text-[#1b3a3a] hover:underline"
            >
              Production
            </Link>
            <span className="text-slate-300">·</span>
            <Link
              href={ROUTES.INVENTORY.STOCK}
              className="text-[#1b3a3a] hover:underline"
            >
              Inventory
            </Link>
            <span className="text-slate-300">·</span>
            <Link
              href={`${ROUTES.SALES.NEW_BILL}?poId=${order.id}`}
              className="text-[#1b3a3a] hover:underline"
            >
              Sales Bill
            </Link>
          </div>
        </div>
      </div>
      {order.specialInstructions ? (
        <div className="mt-4 flex gap-3 rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-700">
          <ClipboardList className="mt-0.5 size-4 shrink-0 text-slate-500" />
          <p>{order.specialInstructions}</p>
        </div>
      ) : null}
    </div>
  );
}
