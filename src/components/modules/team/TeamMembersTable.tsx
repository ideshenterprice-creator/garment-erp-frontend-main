"use client";

import { format } from "date-fns";
import type { MockTeamMember } from "@/mock/team";
import { getMemberInitials } from "@/mock/team";
import { EmptyState } from "@/components/common/EmptyState";
import { InviteStatusBadge } from "@/components/modules/team/InviteStatusBadge";
import { MemberRoleBadge } from "@/components/modules/team/MemberRoleBadge";
import { MemberStatusBadge } from "@/components/modules/team/MemberStatusBadge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface TeamMembersTableProps {
  members: MockTeamMember[];
  currentUserId?: string;
  currentUserEmail?: string;
  onInvite?: () => void;
  onDeactivate: (member: MockTeamMember) => void;
  onResend: (member: MockTeamMember) => void;
  onReactivate: (member: MockTeamMember) => void;
}

function isSelf(
  member: MockTeamMember,
  currentUserId?: string,
  currentUserEmail?: string
): boolean {
  if (currentUserId && member.id === currentUserId) return true;
  if (
    currentUserEmail &&
    member.email.toLowerCase() === currentUserEmail.toLowerCase()
  ) {
    return true;
  }
  return false;
}

export function TeamMembersTable({
  members,
  currentUserId,
  currentUserEmail,
  onInvite,
  onDeactivate,
  onResend,
  onReactivate,
}: TeamMembersTableProps) {
  if (members.length === 0) {
    return (
      <EmptyState
        title="No team members found"
        description="Invite an admin or team member to get started."
        actionLabel="+ Invite Member"
        onAction={onInvite}
      />
    );
  }

  return (
    <TooltipProvider>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
                <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Member
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Role
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Status
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Invite Status
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Joined Date
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => {
                const self = isSelf(member, currentUserId, currentUserEmail);
                const pending = !member.inviteAccepted;
                const inactive = member.inviteAccepted && !member.isActive;

                return (
                  <TableRow
                    key={member.id}
                    className={cn(
                      pending && "bg-amber-50/60 hover:bg-amber-50/80",
                      inactive && "bg-slate-50 hover:bg-slate-100/80"
                    )}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#1b3a3a] text-xs font-bold text-white">
                          {getMemberInitials(member.name)}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-slate-900">
                            {member.name}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {member.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <MemberRoleBadge role={member.role} />
                    </TableCell>
                    <TableCell>
                      <MemberStatusBadge isActive={member.isActive} />
                    </TableCell>
                    <TableCell>
                      <InviteStatusBadge
                        inviteAccepted={member.inviteAccepted}
                      />
                    </TableCell>
                    <TableCell>
                      {format(new Date(member.createdAt), "dd MMM yyyy")}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap items-center gap-1">
                        {pending ? (
                          <>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="text-teal-700 hover:text-teal-800"
                              onClick={() => onResend(member)}
                            >
                              Resend Invite
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:bg-red-50 hover:text-red-700"
                              onClick={() => onDeactivate(member)}
                            >
                              Deactivate
                            </Button>
                          </>
                        ) : null}

                        {!pending && member.isActive ? (
                          self ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    disabled
                                    className="text-red-600"
                                  >
                                    Deactivate
                                  </Button>
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>
                                Cannot deactivate your own account
                              </TooltipContent>
                            </Tooltip>
                          ) : (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:bg-red-50 hover:text-red-700"
                              onClick={() => onDeactivate(member)}
                            >
                              Deactivate
                            </Button>
                          )
                        ) : null}

                        {!pending && !member.isActive ? (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => onReactivate(member)}
                          >
                            Reactivate
                          </Button>
                        ) : null}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </TooltipProvider>
  );
}
