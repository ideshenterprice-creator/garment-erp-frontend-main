"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { toast } from "sonner";
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
import { QUERY_KEYS } from "@/constants/queryKeys";
import {
  deactivateMember,
  getTeamMembers,
  type TeamMember,
} from "@/services/team.service";
import { getApiErrorMessage } from "@/lib/apiError";
import { Button } from "@/components/ui/button";

type TeamFilter =
  | "ALL"
  | "ADMINS"
  | "TEAM_MEMBERS"
  | "PENDING"
  | "INACTIVE";

const PAGE_SIZE = 10;

export default function TeamManagementPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const [filter, setFilter] = useState<TeamFilter>("ALL");
  const [page, setPage] = useState(1);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [deactivateTarget, setDeactivateTarget] = useState<TeamMember | null>(
    null
  );
  const [resendTarget, setResendTarget] = useState<TeamMember | null>(null);

  useEffect(() => {
    if (user?.role === "TEAM_MEMBER") {
      router.replace(ROUTES.MASTERS.PARTY);
    }
  }, [user, router]);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: QUERY_KEYS.TEAM_MEMBERS,
    queryFn: () => getTeamMembers({}),
    enabled: user?.role === "ADMIN",
  });

  const members = data?.data.members ?? [];
  const total = data?.data.total ?? members.length;

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => deactivateMember(id),
    onSuccess: () => {
      if (deactivateTarget) {
        toast.success(`${deactivateTarget.name} has been deactivated.`);
      }
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TEAM_MEMBERS });
      setDeactivateTarget(null);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });

  const stats = useMemo(
    () => ({
      total,
      admins: members.filter((m) => m.role === "ADMIN").length,
      pending: members.filter((m) => !m.inviteAccepted).length,
    }),
    [members, total]
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

  if (user?.role === "TEAM_MEMBER") {
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

      {isLoading ? (
        <TableSkeleton rows={6} />
      ) : isError ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-6 py-12 text-center">
          <p className="text-sm font-medium text-slate-900">
            Could not load team members
          </p>
          <p className="text-sm text-muted-foreground">
            Check your connection and try again.
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={() => void refetch()}
          >
            Retry
          </Button>
        </div>
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
        existingEmails={members.map((m) => m.email)}
        onClose={() => setInviteOpen(false)}
      />

      <DeactivateMemberDialog
        open={Boolean(deactivateTarget)}
        member={deactivateTarget}
        isLoading={deactivateMutation.isPending}
        onClose={() => {
          if (!deactivateMutation.isPending) {
            setDeactivateTarget(null);
          }
        }}
        onConfirm={() => {
          if (!deactivateTarget) return;
          deactivateMutation.mutate(deactivateTarget.id);
        }}
      />

      <ResendInviteDialog
        open={Boolean(resendTarget)}
        member={resendTarget}
        onClose={() => setResendTarget(null)}
      />
    </div>
  );
}
