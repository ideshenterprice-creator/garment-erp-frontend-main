import { CalendarDays, CheckCircle2, Truck } from "lucide-react";

interface BoxStatCardsProps {
  boxesPackedThisMonth: number;
  totalPiecesPacked: number;
  boxesLoadedInContainer: number;
}

export function BoxStatCards({
  boxesPackedThisMonth,
  totalPiecesPacked,
  boxesLoadedInContainer,
}: BoxStatCardsProps) {
  return (
    <div className="mb-6 grid gap-4 md:grid-cols-3">
      <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-sky-600">
          <CalendarDays className="size-5" />
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Boxes Packed This Month
          </p>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {boxesPackedThisMonth}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4 rounded-xl border border-slate-200 border-t-2 border-t-orange-400 bg-white p-4 shadow-sm">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-orange-600">
          <CheckCircle2 className="size-5" />
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Total Pieces Packed
          </p>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {totalPiecesPacked.toLocaleString("en-IN")}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
          <Truck className="size-5" />
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Boxes Loaded in Container
          </p>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {boxesLoadedInContainer}
          </p>
        </div>
      </div>
    </div>
  );
}
