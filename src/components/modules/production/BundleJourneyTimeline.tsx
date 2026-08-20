import type { JourneyStageStatus, BundleJourneyStage } from "@/mock/production";
import { cn } from "@/lib/utils";

const statusDot: Record<JourneyStageStatus, string> = {
  COMPLETED: "bg-emerald-500 border-emerald-500",
  IN_PROGRESS: "bg-amber-400 border-amber-400",
  NOT_STARTED: "bg-slate-200 border-slate-300",
};

interface BundleJourneyTimelineProps {
  stages: BundleJourneyStage[];
}

export function BundleJourneyTimeline({ stages }: BundleJourneyTimelineProps) {
  return (
    <div className="space-y-0">
      {stages.map((stage, index) => {
        const isLast = index === stages.length - 1;
        return (
          <div key={stage.stage} className="relative flex gap-4 pb-6 last:pb-0">
            {!isLast ? (
              <span className="absolute left-[9px] top-5 h-[calc(100%-8px)] w-px bg-slate-200" />
            ) : null}
            <span
              className={cn(
                "relative z-10 mt-1 size-[18px] shrink-0 rounded-full border-2",
                statusDot[stage.status]
              )}
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-900">{stage.stage}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {stage.summary}
                  </p>
                  {stage.subItems?.length ? (
                    <ul className="mt-2 space-y-1 border-l border-slate-200 pl-3">
                      {stage.subItems.map((item) => (
                        <li key={item.label} className="text-sm">
                          <span className="font-medium text-slate-800">
                            {item.label}
                          </span>
                          <span className="text-muted-foreground">
                            {" "}
                            · {item.summary}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
                <span className="shrink-0 text-sm text-slate-500">
                  {stage.dateLabel}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
