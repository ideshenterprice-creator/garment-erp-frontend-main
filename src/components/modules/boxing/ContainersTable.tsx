"use client";

import Link from "next/link";
import type { Container } from "@/types";
import { EmptyState } from "@/components/common/EmptyState";
import { ContainerStatusBadge } from "@/components/modules/boxing/ContainerStatusBadge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ROUTES } from "@/constants/routes";

interface ContainersTableProps {
  containers: Container[];
  onAdd?: () => void;
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

export function ContainersTable({ containers, onAdd }: ContainersTableProps) {
  if (containers.length === 0) {
    return (
      <EmptyState
        title="No containers found"
        description="Create a container to start loading packed boxes for dispatch."
        actionLabel="+ New Container"
        onAction={onAdd}
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Container
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                PO
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Buyer
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Boxes
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Pieces
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Destination
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Dispatch
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Status
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {containers.map((container) => (
              <TableRow key={container.id}>
                <TableCell className="font-semibold text-slate-900">
                  {container.containerNumber}
                </TableCell>
                <TableCell>
                  {container.po?.poNumber ?? container.poId}
                </TableCell>
                <TableCell>{container.buyer?.name ?? "—"}</TableCell>
                <TableCell>
                  {container.boxCount ?? container.boxes?.length ?? 0}
                </TableCell>
                <TableCell>
                  {(
                    container.totalPieces ??
                    container.boxes?.reduce(
                      (sum, box) => sum + Number(box.totalPieces ?? 0),
                      0
                    ) ??
                    0
                  ).toLocaleString("en-IN")}
                </TableCell>
                <TableCell>{container.destination}</TableCell>
                <TableCell>{formatDate(container.dispatchDate)}</TableCell>
                <TableCell>
                  <ContainerStatusBadge status={container.status} />
                </TableCell>
                <TableCell>
                  <Button asChild variant="outline" size="sm">
                    <Link href={ROUTES.BOXING.CONTAINER_DETAIL(container.id)}>
                      View
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
