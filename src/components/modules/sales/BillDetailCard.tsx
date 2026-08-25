"use client";

import Link from "next/link";
import type { SalesBill } from "@/types";
import { Info } from "lucide-react";
import { ROUTES } from "@/constants/routes";

interface BillDetailCardProps {
  bill: SalesBill;
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
            {bill.buyer?.name ?? "—"}
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
            {bill.po?.poNumber ?? bill.poId}
          </Link>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Currency
          </p>
          <p className="mt-1 text-sm font-medium text-slate-900">
            {bill.currency}
            {bill.exchangeRate && bill.currency !== "INR"
              ? ` · Rate ${bill.exchangeRate}`
              : ""}
          </p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Container
          </p>
          <p className="mt-1 text-sm font-medium text-slate-900">
            {bill.container?.containerNumber ?? "—"}
          </p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Buyer PO Ref
          </p>
          <p className="mt-1 text-sm font-medium text-slate-900">
            {bill.po?.buyerPoReference ?? "—"}
          </p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Destination
          </p>
          <p className="mt-1 text-sm font-medium text-slate-900">
            {bill.container?.destination ?? "—"}
          </p>
        </div>
      </div>
    </div>
  );
}
