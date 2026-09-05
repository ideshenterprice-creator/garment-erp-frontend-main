import { NextRequest, NextResponse } from "next/server";
import { resolveBackendOrigin } from "@/lib/apiBase";
import {
  HOP_BY_HOP,
  readSetCookies,
  rewriteSetCookieForFrontend,
} from "@/lib/proxyCookies";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

type RouteContext = { params: { path: string[] } };

async function proxy(req: NextRequest, path: string[]) {
  const origin = resolveBackendOrigin();
  if (!origin) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message:
            "Backend is not configured. Generate a public domain on Railway (chic-presence → Settings → Networking → Generate Domain), then set NEXT_PUBLIC_API_URL=https://<that-host>/api on Vercel.",
        },
      },
      { status: 503 }
    );
  }

  const suffix = path.map(encodeURIComponent).join("/");
  const target = `${origin}/api/${suffix}${req.nextUrl.search}`;

  const headers = new Headers();
  req.headers.forEach((value, key) => {
    if (HOP_BY_HOP.has(key.toLowerCase())) return;
    headers.set(key, value);
  });
  const cookie = req.headers.get("cookie");
  if (cookie) {
    headers.set("cookie", cookie);
  }

  const method = req.method.toUpperCase();
  const hasBody = method !== "GET" && method !== "HEAD";

  let upstream: Response;
  try {
    upstream = await fetch(target, {
      method,
      headers,
      body: hasBody ? await req.arrayBuffer() : undefined,
      redirect: "manual",
      cache: "no-store",
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: { message: "Could not reach the backend API." },
      },
      { status: 502 }
    );
  }

  const outgoing = new Headers();
  upstream.headers.forEach((value, key) => {
    const lower = key.toLowerCase();
    if (HOP_BY_HOP.has(lower) || lower === "set-cookie") return;
    outgoing.set(key, value);
  });

  const setCookies = readSetCookies(upstream.headers).map(rewriteSetCookieForFrontend);

  // Buffering auth cookie responses avoids a Next.js streaming bug that drops Set-Cookie.
  const body =
    setCookies.length > 0 ? await upstream.arrayBuffer() : upstream.body;

  const response = new NextResponse(body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: outgoing,
  });

  for (const cookieValue of setCookies) {
    response.headers.append("set-cookie", cookieValue);
  }

  return response;
}

export async function GET(req: NextRequest, ctx: RouteContext) {
  return proxy(req, ctx.params.path);
}

export async function POST(req: NextRequest, ctx: RouteContext) {
  return proxy(req, ctx.params.path);
}

export async function PUT(req: NextRequest, ctx: RouteContext) {
  return proxy(req, ctx.params.path);
}

export async function PATCH(req: NextRequest, ctx: RouteContext) {
  return proxy(req, ctx.params.path);
}

export async function DELETE(req: NextRequest, ctx: RouteContext) {
  return proxy(req, ctx.params.path);
}

export async function HEAD(req: NextRequest, ctx: RouteContext) {
  return proxy(req, ctx.params.path);
}

export async function OPTIONS(req: NextRequest, ctx: RouteContext) {
  return proxy(req, ctx.params.path);
}
