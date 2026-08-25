import { FileText } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import type { PurchaseBill } from "@/types";
import { BillStatusBadge } from "@/components/modules/purchase/BillStatusBadge";
import { ROUTES } from "@/constants/routes";
import { formatCurrency } from "@/lib/utils";

interface BillDetailCardProps {
  bill: PurchaseBill;
}

export function BillDetailCard({ bill }: BillDetailCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <FileText className="size-4 text-slate-500" />
          <h2 className="font-semibold text-slate-900">Bill Information</h2>
        </div>
        <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          General Details
        </span>
      </div>

      <div className="grid gap-x-8 gap-y-3 md:grid-cols-2">
        <InfoRow label="Bill No" value={bill.billNumber} />
        <InfoRow label="Fabric" value={bill.product.name} bold />
        <InfoRow
          label="Supplier Invoice"
          value={bill.supplierInvoiceNo ?? "—"}
        />
        <InfoRow
          label="Gross Weight"
          value={`${Number(bill.grossWeight).toLocaleString("en-IN")} kg`}
        />
        <InfoRow label="Supplier" value={bill.supplier.name} />
        <InfoRow
          label="Tare Weight"
          value={`${Number(bill.tareWeight).toLocaleString("en-IN")} kg`}
        />
        <InfoRow
          label="Date"
          value={format(new Date(bill.purchaseDate), "dd MMM yyyy")}
        />
        <div className="-mx-2 rounded-md bg-amber-50 px-2 py-2 md:col-span-2 md:grid md:grid-cols-2 md:gap-x-8">
          <InfoRow
            label="Net Weight"
            value={`${Number(bill.netWeight).toLocaleString("en-IN")} kg`}
            bold
          />
          <div />
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Linked PO
          </p>
          {bill.poId && bill.po ? (
            <Link
              href={ROUTES.PURCHASE_ORDERS.DETAIL(bill.poId)}
              className="mt-1 inline-block text-sm font-medium text-amber-800 hover:underline"
            >
              {bill.po.poNumber}
              {bill.po.buyer?.name ? ` — ${bill.po.buyer.name}` : ""}
            </Link>
          ) : (
            <p className="mt-1 text-sm font-medium text-slate-900">—</p>
          )}
        </div>
        <InfoRow
          label="Rate"
          value={`₹${Number(bill.ratePerKg).toLocaleString("en-IN")}/kg`}
        />
        <InfoRow label="Vehicle" value={bill.vehicleNumber || "—"} />
        <InfoRow
          label={`GST (${Number(bill.gstPercent)}%)`}
          value={formatCurrency(Number(bill.gstAmount))}
        />
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Status
          </p>
          <div className="mt-1">
            <BillStatusBadge status={bill.status} />
          </div>
        </div>
        <InfoRow
          label="Total Amount"
          value={formatCurrency(Number(bill.totalAmount))}
          bold
          large
        />
        {bill.supplier.city || bill.supplier.contact ? (
          <InfoRow
            label="Supplier Contact"
            value={[bill.supplier.city, bill.supplier.contact]
              .filter(Boolean)
              .join(" · ")}
          />
        ) : null}
      </div>
    </div>
  );
}

function InfoRow({
  label,
  value,
  bold,
  large,
}: {
  label: string;
  value: string;
  bold?: boolean;
  large?: boolean;
}) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p
        className={`mt-1 text-sm text-slate-900 ${
          bold ? "font-semibold" : "font-medium"
        } ${large ? "text-base" : ""}`}
      >
        {value}
      </p>
    </div>
  );
}
