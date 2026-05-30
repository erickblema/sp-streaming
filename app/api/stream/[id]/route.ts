import { NextResponse } from "next/server";

import { getMatchById, getPlayableServers, getStreamUrl } from "@/lib/rapidapi";

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

    const url = await getStreamUrl(id);
    const servers = getPlayableServers(match);

    return NextResponse.json({
      url,
      servers: servers.map((server) => ({
        name: server.name,
        type: server.type,
      })),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch stream";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
