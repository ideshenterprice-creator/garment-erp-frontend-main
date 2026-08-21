import { cn, formatCurrency } from "@/lib/utils";

interface BalanceDisplayProps {
  amount: number;
  className?: string;
  bold?: boolean;
}

export function BalanceDisplay({
  amount,
  className,
  bold = false,
}: BalanceDisplayProps) {
  const display =
    amount < 0
      ? `-${formatCurrency(Math.abs(amount))}`
      : formatCurrency(amount);

  return (
    <span
      className={cn(
        amount > 0
          ? "text-red-600"
          : amount < 0
            ? "text-emerald-600"
            : "text-slate-700",
        bold && "font-bold",
        className
      )}
    >
      {display}
    </span>
  );
}
