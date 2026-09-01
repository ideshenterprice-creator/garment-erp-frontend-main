"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Bell, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ROUTES } from "@/constants/routes";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { useDebounce } from "@/hooks/useDebounce";
import { getUnreadCount } from "@/services/notifications.service";
import { globalSearch, type SearchResult } from "@/services/search.service";
import { cn } from "@/lib/utils";

function getSearchPlaceholder(pathname: string): string {
  if (pathname.startsWith("/masters/party")) {
    return "Search parties, GSTIN or cities...";
  }
  if (pathname.startsWith("/masters/product")) {
    return "Search products, orders, or materials...";
  }
  if (pathname.startsWith("/purchase-orders")) {
    return "Search purchase orders or buyers...";
  }
  if (pathname.startsWith("/notifications")) {
    return "Search notifications...";
  }
  return "Search parties, products, orders...";
}

export function Topbar() {
  const pathname = usePathname();
  const router = useRouter();
  const placeholder = getSearchPlaceholder(pathname);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounced = useDebounce(query.trim(), 300);

  const unreadQuery = useQuery({
    queryKey: [...QUERY_KEYS.NOTIFICATIONS, "unread"],
    queryFn: getUnreadCount,
    refetchInterval: 30000,
  });
  const unreadCount = unreadQuery.data?.data.unreadCount ?? 0;

  const searchQuery = useQuery({
    queryKey: [...QUERY_KEYS.SEARCH, debounced],
    queryFn: () => globalSearch(debounced),
    enabled: debounced.length >= 2,
  });
  const results = searchQuery.data?.data.results ?? [];

  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function goTo(result: SearchResult) {
    setOpen(false);
    setQuery("");
    router.push(result.href);
  }

  return (
    <header className="flex h-14 items-center gap-4 border-b border-slate-200 bg-white px-4 md:px-6">
      <div className="mx-auto flex w-full max-w-xl items-center">
        <div className="relative w-full" ref={containerRef}>
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <Input
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            placeholder={placeholder}
            className="h-10 rounded-lg border-slate-200 bg-slate-50 pl-9 text-sm focus-visible:ring-[#1b3a3a]"
          />
          {open && debounced.length >= 2 ? (
            <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
              {searchQuery.isLoading ? (
                <p className="px-3 py-3 text-sm text-muted-foreground">Searching...</p>
              ) : searchQuery.isError ? (
                <p className="px-3 py-3 text-sm text-red-600">Search failed. Try again.</p>
              ) : results.length === 0 ? (
                <p className="px-3 py-3 text-sm text-muted-foreground">No matching records.</p>
              ) : (
                <ul className="max-h-80 overflow-y-auto py-1">
                  {results.map((result) => (
                    <li key={`${result.type}-${result.id}`}>
                      <button
                        type="button"
                        onClick={() => goTo(result)}
                        className="flex w-full flex-col px-3 py-2 text-left hover:bg-slate-50"
                      >
                        <span className="text-sm font-medium text-slate-900">{result.title}</span>
                        <span className="text-xs text-muted-foreground">
                          {result.type.replaceAll("_", " ")} · {result.subtitle}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : null}
        </div>
      </div>
      <div className="ml-auto flex items-center gap-1">
        <Link
          href={ROUTES.NOTIFICATIONS}
          className={cn(
            "relative rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800",
            pathname.startsWith("/notifications") && "bg-slate-100 text-slate-900"
          )}
          aria-label="Notifications"
        >
          <Bell className="size-5" />
          {unreadCount > 0 ? (
            <span className="absolute right-1 top-1 flex size-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-semibold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          ) : null}
        </Link>
      </div>
    </header>
  );
}
