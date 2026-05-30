import { NextResponse } from "next/server";

import {
  fetchStreamResource,
  rewriteManifest,
} from "@/lib/hls-proxy";

function proxyResponseHeaders(
  upstream: Response,
  contentType: string,
): HeadersInit {
  const headers: Record<string, string> = {
    "Content-Type": contentType,
    "Cache-Control": "no-store",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Expose-Headers": "Content-Length, Content-Range, Accept-Ranges",
  };

  const contentRange = upstream.headers.get("content-range");
  const acceptRanges = upstream.headers.get("accept-ranges");
  const contentLength = upstream.headers.get("content-length");

  if (contentRange) headers["Content-Range"] = contentRange;
  if (acceptRanges) headers["Accept-Ranges"] = acceptRanges;
  if (contentLength) headers["Content-Length"] = contentLength;

  return headers;
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const targetUrl = requestUrl.searchParams.get("url");

  if (!targetUrl) {
    return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
  }

  try {
    const parsedTarget = new URL(targetUrl);
    const upstream = await fetchStreamResource(
      parsedTarget.toString(),
      parsedTarget.origin,
      undefined,
      request.headers,
    );

    if (!upstream.ok) {
      return NextResponse.json(
        { error: `Upstream returned ${upstream.status}` },
        { status: upstream.status },
      );
    }

    const contentType = upstream.headers.get("content-type") ?? "application/octet-stream";
    const probablyManifest =
      parsedTarget.pathname.endsWith(".m3u8") ||
      contentType.includes("mpegurl");

    if (probablyManifest) {
      const body = await upstream.text();

      if (body.startsWith("#EXTM3U")) {
        const manifest = rewriteManifest(body, parsedTarget.toString());

        return new Response(manifest, {
          headers: {
            "Content-Type": "application/vnd.apple.mpegurl",
            "Cache-Control": "no-store",
            "Access-Control-Allow-Origin": "*",
          },
        });
      }

      return new Response(body, {
        status: upstream.status,
        headers: proxyResponseHeaders(upstream, contentType),
      });
    }

    const buffer = await upstream.arrayBuffer();

    return new Response(buffer, {
      status: upstream.status,
      headers: proxyResponseHeaders(
        upstream,
        contentType || "video/mp2t",
      ),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to proxy stream segment";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function HEAD(request: Request) {
  const targetUrl = new URL(request.url).searchParams.get("url");

  if (!targetUrl) {
    return new Response(null, { status: 400 });
  }

  try {
    const upstream = await fetchStreamResource(
      targetUrl,
      new URL(targetUrl).origin,
      undefined,
      request.headers,
    );

    return new Response(null, {
      status: upstream.status,
      headers: proxyResponseHeaders(
        upstream,
        upstream.headers.get("content-type") ?? "application/octet-stream",
      ),
    });
  } catch {
    return new Response(null, { status: 502 });
  }
}
