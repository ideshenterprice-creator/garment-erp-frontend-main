"use client";

import Link from "next/link";
import type { POProductionStages, POStageProgressStatus } from "@/types";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface StageRow {
  stage: string;
  issued: number;
  done: number;
  pending: number;
  status: POStageProgressStatus;
}

interface POProductionProgressProps {
  stages: StageRow[];
  progressPercent: number;
}

function stageBadge(status: POStageProgressStatus) {
  if (status === "DONE") {
    return {
      label: "DONE",
      className: "bg-emerald-100 text-emerald-700",
    };
  }
  if (status === "IN_PROGRESS") {
    return {
      label: "IN PROGRESS",
      className: "bg-amber-100 text-amber-800",
    };
  }
  return {
    label: "PENDING",
    className: "bg-slate-100 text-slate-600",
  };
}

export function stagesFromProductionProgress(
  progress?: POProductionStages | null
): StageRow[] {
  const empty: StageRow[] = [
    { stage: "Cutting", issued: 0, done: 0, pending: 0, status: "PENDING" },
    { stage: "Printing", issued: 0, done: 0, pending: 0, status: "PENDING" },
    { stage: "Coloring", issued: 0, done: 0, pending: 0, status: "PENDING" },
    { stage: "Stitching", issued: 0, done: 0, pending: 0, status: "PENDING" },
    { stage: "Finishing", issued: 0, done: 0, pending: 0, status: "PENDING" },
  ];

  if (!progress) return empty;

  const mapStage = (
    label: string,
    data: POProductionStages[keyof POProductionStages]
  ): StageRow => ({
    stage: label,
    issued: Number(data.issued),
    done: Number(data.completed),
    pending: Number(data.pending),
    status: data.status,
  });

  return [
    mapStage("Cutting", progress.cutting),
    mapStage("Printing", progress.printing),
    mapStage("Coloring", progress.coloring),
    mapStage("Stitching", progress.stitching),
    mapStage("Finishing", progress.finishing),
  ];
}

export function calcStagesProgressPercent(stages: StageRow[]): number {
  const totalIssued = stages.reduce((sum, stage) => sum + stage.issued, 0);
  const totalDone = stages.reduce((sum, stage) => sum + stage.done, 0);
  if (totalIssued === 0) return 0;
  return Math.round((totalDone / totalIssued) * 100);
}

export function POProductionProgress({
  stages,
  progressPercent,
}: POProductionProgressProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold text-slate-900">
            Production Live Tracking
          </h2>
          <Link
            href={ROUTES.PRODUCTION.ROOT}
            className="text-xs font-medium text-[#1b3a3a] hover:underline"
          >
            Open Production →
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-2 w-40 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-orange-400"
              style={{
                width: `${Math.min(100, Math.max(0, progressPercent))}%`,
              }}
            />
          </div>
          <span className="text-xs font-medium text-slate-500">
            {progressPercent}%
          </span>
        </div>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Stage</TableHead>
              <TableHead className="text-right">Issued</TableHead>
              <TableHead className="text-right">Done</TableHead>
              <TableHead className="text-right">Pend.</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stages.map((stage) => {
              const badge = stageBadge(stage.status);
              return (
                <TableRow key={stage.stage}>
                  <TableCell className="font-medium">
                    <Link
                      href={ROUTES.PRODUCTION.ROOT}
                      className="text-[#1b3a3a] hover:underline"
                    >
                      {stage.stage}
                    </Link>
                  </TableCell>
                  <TableCell className="text-right">
                    {stage.issued.toLocaleString("en-IN")}
                  </TableCell>
                  <TableCell className="text-right">
                    {stage.done.toLocaleString("en-IN")}
                  </TableCell>
                  <TableCell className="text-right">
                    {stage.pending.toLocaleString("en-IN")}
                  </TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
                        badge.className
                      )}
                    >
                      {badge.label}
                    </span>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
