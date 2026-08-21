"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { mockTeamMembers, type MockTeamMember } from "@/mock/team";
import { PageHeader, PageHeaderAction } from "@/components/common/PageHeader";
import { FilterBar } from "@/components/common/FilterBar";
import { TableSkeleton } from "@/components/common/LoadingSpinner";
import { Pagination } from "@/components/common/Pagination";
import { TeamStatCards } from "@/components/modules/team/TeamStatCards";
import { TeamMembersTable } from "@/components/modules/team/TeamMembersTable";
import { InviteMemberDrawer } from "@/components/modules/team/InviteMemberDrawer";
import { DeactivateMemberDialog } from "@/components/modules/team/DeactivateMemberDialog";
import { ResendInviteDialog } from "@/components/modules/team/ResendInviteDialog";
import { useAuthStore } from "@/store/authStore";
import { ROUTES } from "@/constants/routes";

type TeamFilter =
  | "ALL"
  | "ADMINS"
  | "TEAM_MEMBERS"
  | "PENDING"
  | "INACTIVE";

const PAGE_SIZE = 10;

export default function TeamManagementPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<MockTeamMember[]>(mockTeamMembers);
  const [filter, setFilter] = useState<TeamFilter>("ALL");
  const [page, setPage] = useState(1);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [deactivateTarget, setDeactivateTarget] =
    useState<MockTeamMember | null>(null);
  const [resendTarget, setResendTarget] = useState<MockTeamMember | null>(null);

  useEffect(() => {
    if (user?.role === "TEAM_MEMBER") {
      router.replace(ROUTES.MASTERS.PARTY);
      return;
    }
    setAuthorized(true);
    const timer = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(timer);
  }, [user, router]);

  const stats = useMemo(
    () => ({
      total: members.length,
      admins: members.filter((m) => m.role === "ADMIN").length,
      pending: members.filter((m) => !m.inviteAccepted).length,
    }),
    [members]
  );

  const filtered = useMemo(() => {
    switch (filter) {
      case "ADMINS":
        return members.filter((m) => m.role === "ADMIN");
      case "TEAM_MEMBERS":
        return members.filter((m) => m.role === "TEAM_MEMBER");
      case "PENDING":
        return members.filter((m) => !m.inviteAccepted);
      case "INACTIVE":
        return members.filter((m) => m.inviteAccepted && !m.isActive);
      default:
        return members;
    }
  }, [members, filter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (!authorized) {
    return <TableSkeleton rows={6} />;
  }

  return (
    <div>
      <PageHeader
        title="Team Management"
        subtitle="Manage admin and team member access. Only admins can invite or deactivate members."
        actionButton={
          <PageHeaderAction
            label="+ Invite Member"
            icon={<Plus className="size-4" />}
            onClick={() => setInviteOpen(true)}
          />
        }
      />

      <TeamStatCards
        totalMembers={stats.total}
        adminCount={stats.admins}
        pendingInvites={stats.pending}
      />

      <FilterBar
        tabs={[
          { label: "All", value: "ALL" },
          { label: "Admins", value: "ADMINS" },
          { label: "Team Members", value: "TEAM_MEMBERS" },
          { label: "Pending Invites", value: "PENDING" },
          { label: "Inactive", value: "INACTIVE" },
        ]}
        activeTab={filter}
        onTabChange={(value) => {
          setFilter(value as TeamFilter);
          setPage(1);
        }}
      />

      {loading ? (
        <TableSkeleton rows={6} />
      ) : (
        <>
          <TeamMembersTable
            members={pageItems}
            currentUserId={user?.id}
            currentUserEmail={user?.email}
            onInvite={() => setInviteOpen(true)}
            onDeactivate={setDeactivateTarget}
            onResend={setResendTarget}
            onReactivate={() =>
              toast.message("Contact support to reactivate")
            }
          />
          {filtered.length > PAGE_SIZE ? (
            <Pagination
              page={page}
              totalPages={totalPages}
              totalItems={filtered.length}
              pageSize={PAGE_SIZE}
              onPageChange={setPage}
              label="members"
            />
          ) : null}
        </>
      )}

      <InviteMemberDrawer
        open={inviteOpen}
        existing={members}
        onClose={() => setInviteOpen(false)}
        onInvite={(member) => {
          setMembers((prev) => [member, ...prev]);
          setPage(1);
        }}
      />

      <DeactivateMemberDialog
        open={Boolean(deactivateTarget)}
        member={deactivateTarget}
        onClose={() => setDeactivateTarget(null)}
        onConfirm={() => {
          if (!deactivateTarget) return;
          setMembers((prev) =>
            prev.map((item) =>
              item.id === deactivateTarget.id
                ? { ...item, isActive: false }
                : item
            )
          );
          toast.success(`${deactivateTarget.name} has been deactivated.`);
        }}
      />

      <ResendInviteDialog
        open={Boolean(resendTarget)}
        member={resendTarget}
        onClose={() => setResendTarget(null)}
        onConfirm={() => {
          // Link regenerated in dialog; member remains pending
        }}
      />
    </div>
  );
}
