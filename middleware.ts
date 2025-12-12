import { NextRequest, NextResponse } from "next/server";

function handleRedirects(req: NextRequest) {
  const url = req.nextUrl;
  const pathname = url.pathname;

  // /match?id=XXX&sport=football/lineups -> /match/football/XXX/lineups
  if (pathname === "/match") {
    const id = url.searchParams.get("id");
    const rawSport = url.searchParams.get("sport") || "football";
    const [sport, tab] = rawSport.split("/");

    if (id) {
      const dest = new URL(req.url);
      dest.pathname = `/match/${sport}/${id}${tab ? `/${tab}` : ""}`;
      dest.search = "";
      return NextResponse.redirect(dest, 301);
    }
  }

  // /player?id=123 -> /player/123
  if (pathname === "/player") {
    const id = url.searchParams.get("id");
    if (id) {
      const dest = new URL(req.url);
      dest.pathname = `/player/${id}`;
      dest.search = "";
      return NextResponse.redirect(dest, 301);
    }
  }

  // /countries?sport=hockey -> /countries/hockey
  if (pathname === "/countries") {
    const sport = url.searchParams.get("sport");
    if (sport) {
      const dest = new URL(req.url);
      dest.pathname = `/countries/${sport}`;
      dest.search = "";
      return NextResponse.redirect(dest, 301);
    }
  }

  // /?sport=basketball/live&league=12 -> /sports/basketball/live/league/12
  if (pathname === "/") {
    const rawSport = url.searchParams.get("sport");
    const league = url.searchParams.get("league");

    const keep = new URLSearchParams(url.searchParams.toString());
    keep.delete("sport");
    keep.delete("league");

    if (rawSport) {
      const [sport, tab] = rawSport.split("/");
      const dest = new URL(req.url);

      dest.pathname = league
        ? `/sports/${sport}/${tab || "all"}/league/${league}`
        : `/sports/${sport}/${tab || "all"}`;

      dest.search = keep.toString() ? `?${keep.toString()}` : "";
      return NextResponse.redirect(dest, 301);
    }
  }

  return NextResponse.next();
}

// ✅ OLD convention (Next expects this sometimes)
export function middleware(req: NextRequest) {
  return handleRedirects(req);
}

// ✅ NEW convention (Next expects this sometimes)
export function proxy(req: NextRequest) {
  return handleRedirects(req);
}

export const config = {
  matcher: ["/", "/match", "/player", "/countries"],
};
