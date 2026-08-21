import type { UserRole } from "@/types";

export interface MockTeamMember {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  inviteAccepted: boolean;
}

// TODO: Replace with TanStack Query API call
// Service: src/services/auth.service.ts
// Query key: QUERY_KEYS.TEAM_MEMBERS
export const mockTeamMembers: MockTeamMember[] = [
  {
    id: "1",
    name: "Raj Sharma",
    email: "raj@fabricflow.com",
    role: "ADMIN",
    isActive: true,
    createdAt: "2024-01-10T00:00:00Z",
    inviteAccepted: true,
  },
  {
    id: "2",
    name: "Abhishek Gupta",
    email: "abhishek@fabricflow.com",
    role: "TEAM_MEMBER",
    isActive: true,
    createdAt: "2024-01-15T00:00:00Z",
    inviteAccepted: true,
  },
  {
    id: "3",
    name: "Priya Singh",
    email: "priya@fabricflow.com",
    role: "TEAM_MEMBER",
    isActive: false,
    createdAt: "2024-02-01T00:00:00Z",
    inviteAccepted: true,
  },
  {
    id: "4",
    name: "Pending Invite",
    email: "newuser@fabricflow.com",
    role: "TEAM_MEMBER",
    isActive: false,
    createdAt: "2024-02-10T00:00:00Z",
    inviteAccepted: false,
  },
];

export function getMemberInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function createInviteLink(email?: string): string {
  const token = `temp-dev-token-${Math.random().toString(36).slice(2, 10)}`;
  const params = new URLSearchParams({ token });
  if (email) params.set("email", email);
  return `http://localhost:3000/accept-invite?${params.toString()}`;
}
