"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  Box,
  ChevronDown,
  ClipboardList,
  Database,
  Factory,
  Landmark,
  LogOut,
  Package,
  Receipt,
  ShoppingCart,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { sidebarConfig } from "@/constants/sidebarConfig";
import { ROUTES } from "@/constants/routes";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { useAuthStore } from "@/store/authStore";
import { logout } from "@/services/auth.service";
import { cn } from "@/lib/utils";

const iconMap: Record<string, LucideIcon> = {
  Database,
  ClipboardList,
  ShoppingCart,
  Package,
  Factory,
  Box,
  Receipt,
  Wallet,
  Users,
  Landmark,
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.logout);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    Masters: true,
  });

  const displayName = user?.name ?? "User";
  const displayRole = user?.role === "TEAM_MEMBER" ? "Team Member" : "Admin";

  function isActive(href: string): boolean {
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  function isGroupActive(href: string, subItems?: { href: string }[]): boolean {
    if (isActive(href)) return true;
    return subItems?.some((item) => isActive(item.href)) ?? false;
  }

  async function handleLogout() {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await logout();
    } catch {
      // Always clear local session even if API fails
    } finally {
      clearAuth();
      router.push(ROUTES.AUTH.LOGIN);
      setIsLoggingOut(false);
    }
  }

  return (
    <aside className="hidden h-full w-[268px] shrink-0 flex-col bg-[#1b3a3a] text-white md:flex">
      <div className="px-5 pb-4 pt-6">
        <h1 className="text-xl font-bold tracking-tight">FabricFlow</h1>
        <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/55">
          Industrial ERP
        </p>
      </div>

      <nav className="sidebar-nav flex-1 overflow-y-auto px-3 pb-4">
        <ul className="flex flex-col gap-1">
          {sidebarConfig.map((item) => {
            const Icon = iconMap[item.icon] ?? Database;
            const groupActive = isGroupActive(item.href, item.subItems);
            const isOpen = expanded[item.label] ?? groupActive;

            if (item.adminOnly && user?.role === "TEAM_MEMBER") {
              return null;
            }

            return (
              <li key={item.label}>
                {item.subItems ? (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        setExpanded((prev) => ({
                          ...prev,
                          [item.label]: !isOpen,
                        }))
                      }
                      className={cn(
                        "flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                        groupActive
                          ? "bg-white/10 text-white"
                          : "text-white/75 hover:bg-white/5 hover:text-white"
                      )}
                    >
                      <Icon className="size-4 shrink-0" />
                      <span className="flex-1 text-left">{item.label}</span>
                      <ChevronDown
                        className={cn(
                          "size-4 transition-transform",
                          isOpen ? "rotate-0" : "-rotate-90"
                        )}
                      />
                    </button>
                    {isOpen ? (
                      <ul className="mt-1 ml-2 flex flex-col gap-0.5 border-l border-white/10 pl-3">
                        {item.subItems.map((sub) => {
                          const active = isActive(sub.href);
                          return (
                            <li key={sub.href}>
                              <Link
                                href={sub.href}
                                className={cn(
                                  "relative block rounded-md px-3 py-2 text-sm transition-colors",
                                  active
                                    ? "bg-[#2a5252] font-medium text-amber-200"
                                    : "text-white/65 hover:bg-white/5 hover:text-white"
                                )}
                              >
                                {active ? (
                                  <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-amber-400" />
                                ) : null}
                                {sub.label}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    ) : null}
                  </>
                ) : (
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive(item.href)
                        ? "bg-[#2a5252] text-amber-200"
                        : "text-white/75 hover:bg-white/5 hover:text-white"
                    )}
                  >
                    <Icon className="size-4 shrink-0" />
                    {item.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-white/10 p-3">
        <div className="flex items-center gap-3 rounded-lg bg-[#152e2e] px-3 py-2.5">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-orange-500 text-xs font-bold text-white">
            {getInitials(displayName)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">{displayName}</p>
            <p className="text-xs text-white/55">{displayRole}</p>
          </div>
          <button
            type="button"
            onClick={() => setLogoutConfirmOpen(true)}
            disabled={isLoggingOut}
            className="rounded-md p-1.5 text-white/70 hover:bg-white/10 hover:text-white disabled:opacity-50"
            aria-label="Logout"
            aria-busy={isLoggingOut}
          >
            <LogOut className={cn("size-4", isLoggingOut && "animate-pulse")} />
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={logoutConfirmOpen}
        onClose={() => {
          if (!isLoggingOut) setLogoutConfirmOpen(false);
        }}
        title="Log out?"
        description="You will be signed out of FabricFlow ERP and returned to the login page."
        confirmLabel="Log Out"
        cancelLabel="Stay Signed In"
        onConfirm={() => {
          setLogoutConfirmOpen(false);
          void handleLogout();
        }}
      />
    </aside>
  );
}
