"use client";

import { format } from "date-fns";
import type { BundleJourney, BundleStage } from "@/types";
import { cn } from "@/lib/utils";

const STAGE_ORDER: Array<{
  key: keyof BundleJourney["stages"];
  label: string;
  stageEnum: BundleStage;
}> = [
  { key: "cutting", label: "Cutting", stageEnum: "CUTTING" },
  { key: "printing", label: "Printing", stageEnum: "PRINTING" },
  { key: "coloring", label: "Coloring", stageEnum: "COLORING" },
  { key: "stitching", label: "Stitching", stageEnum: "STITCHING" },
  { key: "finishing", label: "Finishing", stageEnum: "FINISHING" },
  { key: "boxing", label: "Boxing", stageEnum: "BOXING" },
];

interface BundleJourneyTimelineProps {
  journey: BundleJourney;
  currentStage: BundleStage;
}

export function BundleJourneyTimeline({
  journey,
  currentStage,
}: BundleJourneyTimelineProps) {
  return (
    <div className="space-y-4">
      {STAGE_ORDER.map((stage, index) => {
        const detail = journey.stages[stage.key];
        const completed = Boolean(detail?.completed);
        const isCurrent = currentStage === stage.stageEnum;
        const circleClass = completed
          ? "bg-emerald-500"
          : isCurrent
            ? "bg-amber-400"
            : "bg-slate-300";

        let summary = "Not started";
        if (detail) {
          if (stage.key === "cutting" && detail.totalPiecesCut != null) {
            summary = `${detail.karigar?.name ?? "—"} · ${Number(detail.totalPiecesCut).toLocaleString("en-IN")} pcs · wastage ${Number(detail.wastageKg ?? 0)} kg`;
          } else if (
            (stage.key === "printing" || stage.key === "coloring") &&
            detail.piecesReturned != null
          ) {
            summary = `${detail.karigar?.name ?? "—"} · returned ${Number(detail.piecesReturned).toLocaleString("en-IN")}${detail.colorApplied ? ` · ${detail.colorApplied}` : ""}`;
          } else if (stage.key === "stitching" && detail.entries?.length) {
            summary = detail.entries
              .map(
                (entry) =>
                  `${entry.operation?.name ?? "Op"}: ${Number(entry.piecesReturned ?? 0).toLocaleString("en-IN")}`
              )
              .join(" · ");
          } else if (stage.key === "finishing" && detail.entries?.length) {
            summary = detail.entries
              .map(
                (entry) =>
                  `${entry.operation?.name ?? "Op"}: ${Number(entry.piecesCompleted ?? 0).toLocaleString("en-IN")}`
              )
              .join(" · ");
          } else if (stage.key === "boxing") {
            summary = detail.boxNumber
              ? `Box ${detail.boxNumber}`
              : completed
                ? "Ready for boxing"
                : "Not started";
          } else if (completed) {
            summary = "Completed";
          }
        }

        return (
          <div key={stage.key} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span className={cn("size-3 rounded-full", circleClass)} />
              {index < STAGE_ORDER.length - 1 ? (
                <span className="mt-1 w-px flex-1 bg-slate-200" />
              ) : null}
            </div>
            <div className="pb-4">
              <p className="text-sm font-semibold text-slate-900">
                {stage.label}
              </p>
              <p className="mt-0.5 text-sm text-slate-600">{summary}</p>
              {detail?.entryDate ? (
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {format(new Date(detail.entryDate), "dd MMM yyyy")}
                </p>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
