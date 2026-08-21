import { Clock, Shield, Users } from "lucide-react";
import { StatCard } from "@/components/common/StatCard";

interface TeamStatCardsProps {
  totalMembers: number;
  adminCount: number;
  pendingInvites: number;
}

export function TeamStatCards({
  totalMembers,
  adminCount,
  pendingInvites,
}: TeamStatCardsProps) {
  return (
    <div className="mb-6 grid gap-4 md:grid-cols-3">
      <StatCard
        label="Total Members"
        value={String(totalMembers)}
        accent="blue"
        icon={<Users className="size-5" />}
      />
      <StatCard
        label="Admins"
        value={String(adminCount)}
        accent="teal"
        icon={<Shield className="size-5" />}
      />
      <StatCard
        label="Pending Invites"
        value={String(pendingInvites)}
        accent="yellow"
        icon={<Clock className="size-5" />}
      />
    </div>
  );
}
