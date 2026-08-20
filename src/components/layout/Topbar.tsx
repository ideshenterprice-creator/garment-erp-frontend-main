"use client";

import { usePathname } from "next/navigation";
import { Bell, Search, Settings } from "lucide-react";
import { Input } from "@/components/ui/input";

function getSearchPlaceholder(pathname: string): string {
  if (pathname.startsWith("/masters/party")) {
    return "Search parties, GSTIN or cities...";
  }
  if (pathname.startsWith("/masters/product")) {
    return "Search products, orders, or materials...";
  }
  if (pathname.startsWith("/masters/operations")) {
    return "Search Master Data...";
  }
  if (pathname.startsWith("/masters/gst")) {
    return "Search categories or tax rates...";
  }
  if (pathname.startsWith("/masters/karigar")) {
    return "Search karigars or operations...";
  }
  return "Search Master Records...";
}

export function Topbar() {
  const pathname = usePathname();
  const placeholder = getSearchPlaceholder(pathname);

  return (
    <header className="flex h-14 items-center gap-4 border-b border-slate-200 bg-white px-4 md:px-6">
      <div className="mx-auto flex w-full max-w-xl items-center">
        <div className="relative w-full">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <Input
            type="search"
            placeholder={placeholder}
            className="h-10 rounded-lg border-slate-200 bg-slate-50 pl-9 text-sm focus-visible:ring-[#1b3a3a]"
          />
        </div>
      </div>
      <div className="ml-auto flex items-center gap-1">
        <button
          type="button"
          className="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
          aria-label="Notifications"
        >
          <Bell className="size-5" />
        </button>
        <button
          type="button"
          className="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
          aria-label="Settings"
        >
          <Settings className="size-5" />
        </button>
      </div>
    </header>
  );
}
