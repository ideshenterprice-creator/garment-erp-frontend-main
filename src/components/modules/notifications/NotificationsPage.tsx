"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import {
  Bell,
  CheckCheck,
  ClipboardList,
  Factory,
  Package,
  Users,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import {
  mockNotifications,
  type AppNotification,
  type NotificationCategory,
} from "@/mock/notifications";
import { PageHeader } from "@/components/common/PageHeader";
import { FilterBar } from "@/components/common/FilterBar";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type NotifFilter = "ALL" | "UNREAD" | NotificationCategory;

function categoryIcon(category: NotificationCategory) {
  switch (category) {
    case "PURCHASE_ORDER":
      return <ClipboardList className="size-4" />;
    case "INVENTORY":
      return <Package className="size-4" />;
    case "PRODUCTION":
      return <Factory className="size-4" />;
    case "ACCOUNTS":
      return <Wallet className="size-4" />;
    case "TEAM":
      return <Users className="size-4" />;
  }
}

function categoryLabel(category: NotificationCategory) {
  switch (category) {
    case "PURCHASE_ORDER":
      return "Purchase Orders";
    case "INVENTORY":
      return "Inventory";
    case "PRODUCTION":
      return "Production";
    case "ACCOUNTS":
      return "Accounts";
    case "TEAM":
      return "Team";
  }
}

export function NotificationsPage() {
  const router = useRouter();
  const [items, setItems] = useState<AppNotification[]>(mockNotifications);
  const [filter, setFilter] = useState<NotifFilter>("ALL");

  const filtered = useMemo(() => {
    if (filter === "ALL") return items;
    if (filter === "UNREAD") return items.filter((item) => !item.isRead);
    return items.filter((item) => item.category === filter);
  }, [items, filter]);

  const unreadCount = items.filter((item) => !item.isRead).length;

  function markAllRead() {
    setItems((prev) => prev.map((item) => ({ ...item, isRead: true })));
    toast.success("All notifications marked as read");
  }

  function openNotification(item: AppNotification) {
    setItems((prev) =>
      prev.map((row) => (row.id === item.id ? { ...row, isRead: true } : row))
    );
    router.push(item.href);
  }

  return (
    <div>
      <PageHeader
        title="Notifications"
        subtitle="Alerts for purchase orders, inventory, production, accounts and team activity."
        actionButton={
          unreadCount > 0 ? (
            <Button type="button" variant="outline" onClick={markAllRead}>
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
        onTabChange={(value) => setFilter(value as NotifFilter)}
      />

      {filtered.length === 0 ? (
        <EmptyState
          title="No notifications"
          description="Nothing to show for this filter."
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <ul className="divide-y divide-slate-100">
            {filtered.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => openNotification(item)}
                  className={cn(
                    "flex w-full items-start gap-3 px-4 py-4 text-left transition-colors hover:bg-slate-50",
                    !item.isRead && "bg-teal-50/40"
                  )}
                >
                  <span
                    className={cn(
                      "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg",
                      item.isRead
                        ? "bg-slate-100 text-slate-500"
                        : "bg-[#1b3a3a]/10 text-[#1b3a3a]"
                    )}
                  >
                    {categoryIcon(item.category)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-slate-900">
                        {item.title}
                      </span>
                      {!item.isRead ? (
                        <span className="rounded-full bg-[#1b3a3a] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                          New
                        </span>
                      ) : null}
                    </span>
                    <span className="mt-0.5 block text-sm text-slate-600">
                      {item.message}
                    </span>
                    <span className="mt-1.5 block text-xs text-muted-foreground">
                      {categoryLabel(item.category)} ·{" "}
                      {formatDistanceToNow(new Date(item.createdAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
