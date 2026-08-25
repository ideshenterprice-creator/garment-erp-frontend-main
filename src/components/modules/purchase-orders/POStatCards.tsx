import { CheckCircle2, ClipboardList, Cog, Truck } from "lucide-react";

interface POStatCardsProps {
  totalActive: number;
  totalInProduction: number;
  totalReadyToShip: number;
  totalCompleted: number;
}

export function POStatCards({
  totalActive,
  totalInProduction,
  totalReadyToShip,
  totalCompleted,
}: POStatCardsProps) {
  const cards = [
    {
      label: "Active POs",
      value: String(totalActive),
      icon: <ClipboardList className="size-5" />,
    },
    {
      label: "In Production",
      value: String(totalInProduction),
      icon: <Cog className="size-5" />,
    },
    {
      label: "Ready to Ship",
      value: String(totalReadyToShip),
      icon: <Truck className="size-5" />,
    },
    {
      label: "Completed",
      value: String(totalCompleted),
      icon: <CheckCircle2 className="size-5" />,
    },
  ];

  return (
    <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {card.label}
            </p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{card.value}</p>
          </div>
          <div className="flex size-10 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
            {card.icon}
          </div>
        </div>
      ))}
    </div>
  );
}
