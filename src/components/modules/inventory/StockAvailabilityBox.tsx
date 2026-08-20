interface StockAvailabilityBoxProps {
  available: number;
  unit: string;
}

export function StockAvailabilityBox({
  available,
  unit,
}: StockAvailabilityBoxProps) {
  return (
    <p className="text-sm font-medium text-teal-700">
      Available: {available.toLocaleString("en-IN")} {unit}
    </p>
  );
}
