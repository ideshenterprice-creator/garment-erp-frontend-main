"use client";

import Link from "next/link";
import type { MockSalesBill } from "@/mock/sales";
import { Info } from "lucide-react";
import { ROUTES } from "@/constants/routes";

interface BillDetailCardProps {
  bill: MockSalesBill;
}

export function BillDetailCard({ bill }: BillDetailCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <Info className="size-4 text-slate-500" />
        <h2 className="text-base font-semibold text-slate-900">Invoice Info</h2>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Customer
          </p>
          <Link
            href={`/masters/party/${bill.buyerId}`}
            className="mt-1 inline-block text-sm font-medium text-[#1b3a3a] hover:underline"
          >
            {bill.buyer.name}
          </Link>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Purchase Order
          </p>
          <Link
            href={ROUTES.PURCHASE_ORDERS.DETAIL(bill.poId)}
            className="mt-1 inline-block text-sm font-medium text-[#1b3a3a] hover:underline"
          >
            {bill.po.poNumber}
          </Link>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Currency
          </p>
          <p className="mt-1 text-sm font-medium text-slate-900">
            {bill.currency}
            {bill.currency === "USD" ? " (United States Dollar)" : ""}
          </p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Carton No.
          </p>
          <p className="mt-1 text-sm font-medium text-slate-900">
            {bill.containerNo || "—"}
          </p>
        </div>
        <div className="sm:col-span-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Billing Address
          </p>
          <p className="mt-1 text-sm font-medium text-slate-900">
            {bill.billingAddress}
          </p>
        </div>
      </div>
    </div>
  );
}
