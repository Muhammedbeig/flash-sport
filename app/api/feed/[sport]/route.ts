// app/api/feed/[sport]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { buildApiRequest } from "@/lib/apiClient";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function normalizeSport(raw?: string) {
  const s = (raw || "football").toLowerCase().trim();
  if (s === "soccer") return "football";
  if (s === "ice-hockey") return "hockey";
  if (s === "american-football") return "nfl";
  return s;
}

const ENDPOINT_MAP: Record<string, string> = {
  football: "fixtures",
  basketball: "games",
  baseball: "games",
  hockey: "games",
  rugby: "games",
  nfl: "games",
  volleyball: "games",
};

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ sport: string }> } // ✅ params is a Promise in Next 16 Turbopack
) {
  try {
    const { sport: sportRaw } = await ctx.params; // ✅ unwrap Promise
    const sport = normalizeSport(sportRaw);

    const endpointPath = ENDPOINT_MAP[sport];
    if (!endpointPath) {
      return NextResponse.json({ error: "Unsupported sport" }, { status: 400 });
    }

    const qs = new URLSearchParams(req.nextUrl.searchParams.toString());

    const { url, headers, viaCDN } = buildApiRequest(sport, endpointPath, qs);

    // Prefer server-only key; keep NEXT_PUBLIC fallback so it still works for you today
    const apiKey = process.env.API_SPORTS_KEY || process.env.NEXT_PUBLIC_API_SPORTS_KEY || "";

    const finalHeaders: Record<string, string> = { ...headers };

    // Only attach keys when NOT using CDN
    if (!viaCDN) {
      if (!apiKey) {
        return NextResponse.json({ error: "Missing API key" }, { status: 500 });
      }

      // Ensure at least one key header exists
      if (!finalHeaders["x-rapidapi-key"] || finalHeaders["x-rapidapi-key"].trim() === "") {
        finalHeaders["x-rapidapi-key"] = apiKey;
      }
      finalHeaders["x-apisports-key"] = apiKey;
    }

    const upstream = await fetch(url, {
      headers: finalHeaders,
      cache: "no-store",
    });

    const text = await upstream.text();

    return new NextResponse(text, {
      status: upstream.status,
      headers: {
        "content-type": upstream.headers.get("content-type") || "application/json",
        "cache-control": "no-store",
      },
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: "Feed proxy failed", detail: e?.message || String(e) },
      { status: 500 }
    );
  }
}
