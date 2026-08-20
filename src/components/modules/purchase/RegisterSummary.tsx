import { IndianRupee, Scale, Wallet } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface RegisterSummaryProps {
  totalPurchases: number;
  totalFabricKg: number;
  pendingPayments: number;
}

export function RegisterSummary({
  totalPurchases,
  totalFabricKg,
  pendingPayments,
}: RegisterSummaryProps) {
  const cards = [
    {
      label: "Total Purchases",
      value: formatCurrency(totalPurchases),
      icon: <IndianRupee className="size-5" />,
      accent: "bg-sky-50 text-sky-600",
    },
    {
      label: "Total Fabric Received",
      value: `${totalFabricKg.toLocaleString("en-IN")} kg`,
      icon: <Scale className="size-5" />,
      accent: "bg-orange-50 text-orange-600",
    },
    {
      label: "Pending Payments",
      value: formatCurrency(pendingPayments),
      icon: <Wallet className="size-5" />,
      accent: "bg-rose-50 text-rose-600",
    },
  ];

  return (
    <div className="mb-6 grid gap-4 md:grid-cols-3">
      {cards.map((card) => (
        <div
          key={card.label}
          className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div
            className={`flex size-11 items-center justify-center rounded-lg ${card.accent}`}
          >
            {card.icon}
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {card.label}
            </p>
            <p className="mt-1 text-xl font-bold text-slate-900">{card.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
