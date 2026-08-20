"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { LogOut, Menu, X } from "lucide-react";
import { sidebarConfig } from "@/constants/sidebarConfig";
import { ROUTES } from "@/constants/routes";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";

export function MobileSidebar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  function handleLogout() {
    logout();
    document.cookie = "ff_auth=; path=/; Max-Age=0; SameSite=Lax";
    router.push(ROUTES.AUTH.LOGIN);
    setOpen(false);
  }

  return (
    <div className="border-b border-slate-200 bg-[#1b3a3a] md:hidden">
      <div className="flex items-center justify-between px-4 py-3">
        <div>
          <p className="text-sm font-bold text-white">FabricFlow</p>
          <p className="text-[10px] uppercase tracking-wider text-white/55">
            Industrial ERP
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="rounded-md p-2 text-white"
          aria-label="Toggle menu"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>
      {open ? (
        <div className="border-t border-white/10 px-3 py-3">
          <ul className="flex flex-col gap-1">
            {sidebarConfig.map((item) => (
              <li key={item.label}>
                {item.subItems ? (
                  <div className="py-1">
                    <p className="px-2 text-xs font-semibold uppercase tracking-wide text-white/50">
                      {item.label}
                    </p>
                    <ul className="mt-1">
                      {item.subItems.map((sub) => (
                        <li key={sub.href}>
                          <Link
                            href={sub.href}
                            onClick={() => setOpen(false)}
                            className={cn(
                              "block rounded-md px-3 py-2 text-sm",
                              pathname.startsWith(sub.href)
                                ? "bg-[#2a5252] text-amber-200"
                                : "text-white/80"
                            )}
                          >
                            {sub.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "block rounded-md px-3 py-2 text-sm",
                      pathname.startsWith(item.href)
                        ? "bg-[#2a5252] text-amber-200"
                        : "text-white/80"
                    )}
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
          <div className="mt-3 flex items-center justify-between rounded-lg bg-[#152e2e] px-3 py-2">
            <div>
              <p className="text-sm font-medium text-white">
                {user?.name ?? "Raj Sharma"}
              </p>
              <p className="text-xs text-white/55">
                {user?.role === "TEAM_MEMBER" ? "Team Member" : "Admin"}
              </p>
            </div>
            <button type="button" onClick={handleLogout} aria-label="Logout">
              <LogOut className="size-4 text-white/70" />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
