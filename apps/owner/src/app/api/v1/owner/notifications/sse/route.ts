import { type NextRequest, NextResponse } from "next/server";

const OWNER_API_BASE = process.env.NEXT_PUBLIC_OWNER_API_BASE_URL ?? "http://localhost:8081";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  if (!token) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const backendRes = await fetch(
    `${OWNER_API_BASE}/api/v1/owner/notifications/sse?token=${encodeURIComponent(token)}`,
    {
      headers: { Accept: "text/event-stream", "Cache-Control": "no-cache" },
      // @ts-expect-error -- Node.js 18 fetch requires duplex for streaming
      duplex: "half",
    }
  );

  if (!backendRes.ok || !backendRes.body) {
    return new NextResponse(null, { status: backendRes.status });
  }

  // backendRes.body(ReadableStream)를 브라우저에 직접 파이프 — 버퍼링 없이 즉시 전달
  return new Response(backendRes.body, {
    status: 200,
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "X-Accel-Buffering": "no",
      Connection: "keep-alive",
    },
  });
}
