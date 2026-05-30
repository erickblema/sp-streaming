import { NextResponse } from "next/server";

import {
  resolveManifestFromUrl,
  rewriteManifest,
} from "@/lib/hls-proxy";
import { getMatchById, getPlayableServers } from "@/lib/rapidapi";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  if (!id) {
    return NextResponse.json({ error: "Match id is required" }, { status: 400 });
  }

  try {
    const match = await getMatchById(id);

    if (!match) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 });
    }

    const servers = getPlayableServers(match);

    if (servers.length === 0) {
      return NextResponse.json(
        { error: "No playable stream servers for this match" },
        { status: 502 },
      );
    }

    for (const server of servers) {
      const resolved = await resolveManifestFromUrl(server.url, server.header);

      if (!resolved) continue;

      const manifest = rewriteManifest(resolved.manifest, resolved.sourceUrl);

      return new Response(manifest, {
        headers: {
          "Content-Type": "application/vnd.apple.mpegurl",
          "Cache-Control": "no-store",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    return NextResponse.json(
      { error: "Stream manifest unavailable for this match" },
      { status: 502 },
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to resolve stream";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
