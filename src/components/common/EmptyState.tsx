import type { ReactNode } from "react";
import { Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  actionButton?: ReactNode;
}

export function EmptyState({
  title = "No data found",
  description = "There are no records to display yet.",
  actionLabel,
  onAction,
  actionButton,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center">
      <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
        <Inbox className="size-5" />
      </div>
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      {actionButton
        ? actionButton
        : actionLabel && onAction
          ? (
              <Button
                type="button"
                className="mt-4 bg-[#1b3a3a] text-white hover:bg-[#1b3a3a]/90"
                onClick={onAction}
              >
                {actionLabel}
              </Button>
            )
          : null}
    </div>
  );
}
