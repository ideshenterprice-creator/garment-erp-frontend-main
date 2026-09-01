"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import {
  Bell,
  CheckCheck,
  ClipboardList,
  Factory,
  Package,
  Trash2,
  Users,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { FilterBar } from "@/components/common/FilterBar";
import { EmptyState } from "@/components/common/EmptyState";
import { TableSkeleton } from "@/components/common/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { cn } from "@/lib/utils";
import { getErrorMessage } from "@/lib/errorHandler";
import {
  deleteNotification,
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type AppNotification,
} from "@/services/notifications.service";

type NotifFilter = "ALL" | "UNREAD" | string;

function categoryFromType(type: string): string {
  if (type.includes("PURCHASE_ORDER")) return "PURCHASE_ORDER";
  if (type.includes("STOCK") || type.includes("PURCHASE_RECEIVED")) return "INVENTORY";
  if (type.includes("PRODUCTION")) return "PRODUCTION";
  if (type.includes("TEAM")) return "TEAM";
  return "ACCOUNTS";
}

function categoryIcon(type: string) {
  switch (categoryFromType(type)) {
    case "PURCHASE_ORDER":
      return <ClipboardList className="size-4" />;
    case "INVENTORY":
      return <Package className="size-4" />;
    case "PRODUCTION":
      return <Factory className="size-4" />;
    case "TEAM":
      return <Users className="size-4" />;
    default:
      return <Wallet className="size-4" />;
  }
}

function hrefFor(item: AppNotification): string {
  if (item.metadata && typeof item.metadata.href === "string") {
    return item.metadata.href;
  }
  return "/notifications";
}

export function NotificationsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<NotifFilter>("ALL");

  const listQuery = useQuery({
    queryKey: [...QUERY_KEYS.NOTIFICATIONS, { filter }],
    queryFn: () =>
      getNotifications({
        limit: 50,
        unreadOnly: filter === "UNREAD",
      }),
  });

  const unreadCount = listQuery.data?.data.unreadCount ?? 0;

  const filtered = useMemo(() => {
    const rows = listQuery.data?.data.data ?? [];
    if (filter === "ALL" || filter === "UNREAD") return rows;
    return rows.filter((item) => categoryFromType(item.type) === filter);
  }, [listQuery.data, filter]);

  const markAll = useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => {
      toast.success("All notifications marked as read");
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.NOTIFICATIONS });
    },
    onError: (error) => toast.error(getErrorMessage(error, "Failed to mark notifications.")),
  });

  const markOne = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.NOTIFICATIONS });
    },
  });

  const remove = useMutation({
    mutationFn: deleteNotification,
    onSuccess: () => {
      toast.success("Notification deleted");
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.NOTIFICATIONS });
    },
    onError: (error) => toast.error(getErrorMessage(error, "Failed to delete notification.")),
  });

  async function openNotification(item: AppNotification) {
    if (!item.isRead) {
      await markOne.mutateAsync(item.id);
    }
    router.push(hrefFor(item));
  }

  return (
    <div>
      <PageHeader
        title="Notifications"
        subtitle="Alerts for purchase orders, inventory, production, accounts and team activity."
        actionButton={
          unreadCount > 0 ? (
            <Button
              type="button"
              variant="outline"
              disabled={markAll.isPending}
              onClick={() => markAll.mutate()}
            >
              <CheckCheck className="size-4" />
              Mark all as read
            </Button>
          ) : null
        }
      />

      <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
        <Bell className="size-4" />
        {unreadCount === 0
          ? "You're all caught up."
          : `${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}`}
      </div>

      <FilterBar
        tabs={[
          { label: "All", value: "ALL" },
          { label: "Unread", value: "UNREAD" },
          { label: "Purchase Orders", value: "PURCHASE_ORDER" },
          { label: "Inventory", value: "INVENTORY" },
          { label: "Production", value: "PRODUCTION" },
          { label: "Accounts", value: "ACCOUNTS" },
          { label: "Team", value: "TEAM" },
        ]}
        activeTab={filter}
        onTabChange={(value) => setFilter(value)}
      />

      {listQuery.isLoading ? (
        <TableSkeleton rows={6} />
      ) : listQuery.isError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-sm text-red-700">Failed to load notifications.</p>
          <Button type="button" variant="outline" className="mt-3" onClick={() => void listQuery.refetch()}>
            Retry
          </Button>
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState title="No notifications" description="Nothing to show for this filter." />
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <ul className="divide-y divide-slate-100">
            {filtered.map((item) => (
              <li key={item.id} className="flex items-stretch">
                <button
                  type="button"
                  onClick={() => void openNotification(item)}
                  className={cn(
                    "flex min-w-0 flex-1 items-start gap-3 px-4 py-4 text-left transition-colors hover:bg-slate-50",
                    !item.isRead && "bg-teal-50/40"
                  )}
                >
                  <span
                    className={cn(
                      "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg",
                      item.isRead ? "bg-slate-100 text-slate-500" : "bg-[#1b3a3a]/10 text-[#1b3a3a]"
                    )}
                  >
                    {categoryIcon(item.type)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-slate-900">{item.title}</span>
                      {!item.isRead ? (
                        <span className="rounded-full bg-[#1b3a3a] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                          New
                        </span>
                      ) : null}
                    </span>
                    <span className="mt-0.5 block text-sm text-slate-600">{item.message}</span>
                    <span className="mt-1.5 block text-xs text-muted-foreground">
                      {categoryFromType(item.type).replaceAll("_", " ")} ·{" "}
                      {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                    </span>
                  </span>
                </button>
                <button
                  type="button"
                  aria-label="Delete notification"
                  className="px-3 text-slate-400 hover:text-red-600"
                  onClick={() => remove.mutate(item.id)}
                >
                  <Trash2 className="size-4" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
