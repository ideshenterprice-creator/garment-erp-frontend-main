import { Check, Clock } from "lucide-react";

interface InviteStatusBadgeProps {
  inviteAccepted: boolean;
}

export function InviteStatusBadge({ inviteAccepted }: InviteStatusBadgeProps) {
  if (inviteAccepted) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
        <Check className="size-3" />
        Accepted
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
      <Clock className="size-3" />
      Pending
    </span>
  );
}
