interface TotalPiecesDisplayProps {
  total: number;
}

export function TotalPiecesDisplay({ total }: TotalPiecesDisplayProps) {
  return (
    <div className="flex items-center justify-between border-t border-slate-200 pt-3">
      <span className="text-sm text-slate-500">Total Pieces:</span>
      <span className="text-lg font-bold text-slate-900">
        {total.toLocaleString("en-IN")} pcs
      </span>
    </div>
  );
}
