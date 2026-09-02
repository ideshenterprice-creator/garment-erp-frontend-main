import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ROUTES } from "@/constants/routes";

const REFRESH_COOKIE = "refreshToken";

const publicPaths = [ROUTES.AUTH.LOGIN, ROUTES.AUTH.ACCEPT_INVITE];

const protectedPrefixes = [
  ROUTES.MASTERS.ROOT,
  ROUTES.PURCHASE_ORDERS.ROOT,
  ROUTES.PURCHASE.ROOT,
  ROUTES.INVENTORY.STOCK,
  "/inventory",
  ROUTES.PRODUCTION.ROOT,
  "/boxing",
  "/sales",
  "/accounts",
  ROUTES.TEAM.ROOT,
  ROUTES.NOTIFICATIONS,
];

function isPublicPath(pathname: string): boolean {
  return publicPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
}

function isProtectedPath(pathname: string): boolean {
  return protectedPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasRefreshToken = Boolean(
    request.cookies.get(REFRESH_COOKIE)?.value
  );

  if (
    hasRefreshToken &&
    (pathname === ROUTES.AUTH.LOGIN ||
      pathname === ROUTES.AUTH.ACCEPT_INVITE ||
      pathname.startsWith(`${ROUTES.AUTH.ACCEPT_INVITE}/`))
  ) {
    return NextResponse.redirect(new URL(ROUTES.MASTERS.PARTY, request.url));
  }

  if (!hasRefreshToken && isProtectedPath(pathname) && !isPublicPath(pathname)) {
    const loginUrl = new URL(ROUTES.AUTH.LOGIN, request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|logo.svg|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
