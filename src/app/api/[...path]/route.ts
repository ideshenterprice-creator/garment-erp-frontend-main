import { NextRequest, NextResponse } from "next/server";
import { resolveBackendOrigin } from "@/lib/apiBase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const HOP_BY_HOP = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailers",
  "transfer-encoding",
  "upgrade",
  "host",
  "content-length",
  "content-encoding",
]);

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

  const cookies =
    typeof upstream.headers.getSetCookie === "function"
      ? upstream.headers.getSetCookie()
      : [];
  for (const cookie of cookies) {
    outgoing.append("set-cookie", cookie);
  }

  return new NextResponse(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: outgoing,
  });
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
