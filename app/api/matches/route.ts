import { NextResponse } from "next/server";

import { getAllMatches } from "@/lib/rapidapi";

export async function GET() {
  try {
    const matches = await getAllMatches();
    return NextResponse.json({ matches });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch matches";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
