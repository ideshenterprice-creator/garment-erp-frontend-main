import api from "@/lib/axios";
import type { ApiResponse } from "@/types/api";
import type { User, UserRole } from "@/types";
import type { ListParams } from "@/services/masters.service";

export interface TeamMember extends User {
  inviteAccepted: boolean;
}

export interface TeamMembersListData {
  members: TeamMember[];
  total: number;
}

export interface InviteMemberResult {
  message: string;
  inviteLink?: string;
}

export async function getTeamMembers(
  params?: ListParams
): Promise<ApiResponse<TeamMembersListData>> {
  const response = await api.get<ApiResponse<TeamMembersListData>>(
    "/team/members",
    { params }
  );
  return response.data;
}

export async function inviteMember(data: {
  name: string;
  email: string;
  role?: UserRole;
}): Promise<ApiResponse<InviteMemberResult>> {
  const response = await api.post<ApiResponse<InviteMemberResult>>(
    "/team/invite",
    data
  );
  return response.data;
}

export async function deactivateMember(
  id: string
): Promise<ApiResponse<{ message: string }>> {
  const response = await api.patch<ApiResponse<{ message: string }>>(
    `/team/members/${id}/deactivate`
  );
  return response.data;
}

export async function resendInvite(
  id: string
): Promise<ApiResponse<InviteMemberResult>> {
  const response = await api.post<ApiResponse<InviteMemberResult>>(
    `/team/resend-invite/${id}`
  );
  return response.data;
}
