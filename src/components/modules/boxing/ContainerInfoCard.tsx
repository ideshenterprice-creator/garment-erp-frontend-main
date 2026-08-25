import type { ContainerDetail } from "@/types";
import { ContainerStatusBadge } from "@/components/modules/boxing/ContainerStatusBadge";

interface ContainerInfoCardProps {
  container: ContainerDetail;
}

function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function ContainerInfoCard({ container }: ContainerInfoCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Container
          </p>
          <h2 className="mt-1 text-xl font-bold text-slate-900">
            {container.containerNumber}
          </h2>
        </div>
        <ContainerStatusBadge status={container.status} />
      </div>
      <dl className="grid gap-3 sm:grid-cols-2">
        <div>
          <dt className="text-xs uppercase tracking-wide text-slate-400">PO</dt>
          <dd className="mt-0.5 font-medium text-slate-800">
            {container.po?.poNumber ?? container.poId}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-slate-400">
            Buyer
          </dt>
          <dd className="mt-0.5 font-medium text-slate-800">
            {container.buyer?.name ?? "—"}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-slate-400">
            Destination
          </dt>
          <dd className="mt-0.5 font-medium text-slate-800">
            {container.destination}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-slate-400">
            Dispatch Date
          </dt>
          <dd className="mt-0.5 font-medium text-slate-800">
            {formatDate(container.dispatchDate)}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-slate-400">
            Boxes
          </dt>
          <dd className="mt-0.5 font-medium text-slate-800">
            {container.sizeSummary.boxCount}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-slate-400">
            Total Pieces
          </dt>
          <dd className="mt-0.5 font-medium text-slate-800">
            {container.sizeSummary.grandTotalPieces.toLocaleString("en-IN")}
          </dd>
        </div>
      </dl>
    </div>
  );
}
