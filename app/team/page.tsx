import Link from "next/link";

const SPORT_HOSTS: Record<string, string> = {
  football: "v3.football.api-sports.io",
  basketball: "v1.basketball.api-sports.io",
  baseball: "v1.baseball.api-sports.io",
  hockey: "v1.hockey.api-sports.io",
  rugby: "v1.rugby.api-sports.io",
  nfl: "v1.american-football.api-sports.io",
  volleyball: "v1.volleyball.api-sports.io",
};

function getHost(sport: string) {
  return SPORT_HOSTS[sport] || SPORT_HOSTS.football;
}

async function apiGetTeam(host: string, id: number, apiKey: string) {
  const url = `https://${host}/teams?id=${id}`;
  const res = await fetch(url, {
    method: "GET",
    headers: {
      // Support both API-SPORTS direct header and RapidAPI-style header.
      "x-apisports-key": apiKey,
      "x-rapidapi-host": host,
      "x-rapidapi-key": apiKey,
    },
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    throw new Error(`Team fetch failed (${res.status})`);
  }

  return res.json();
}

export default async function TeamPage({
  searchParams,
}: {
  searchParams?:
    | { id?: string | string[]; sport?: string | string[] }
    | Promise<{ id?: string | string[]; sport?: string | string[] }>;
}) {
  const apiKey = process.env.NEXT_PUBLIC_API_SPORTS_KEY;

  // Next versions / runtimes may pass searchParams as undefined or even as a Promise.
  const sp = (await Promise.resolve(searchParams ?? {})) as {
    id?: string | string[];
    sport?: string | string[];
  };

  const sportRaw = Array.isArray(sp.sport) ? sp.sport[0] : sp.sport;
  const idRaw = Array.isArray(sp.id) ? sp.id[0] : sp.id;

  const sport = (sportRaw || "football").toLowerCase();
  const id = Number(idRaw);

  if (!apiKey) {
    return (
      <div className="p-6">
        <div className="theme-border border rounded-xl p-4 text-sm text-red-500">
          Missing API key (<span className="font-mono">NEXT_PUBLIC_API_SPORTS_KEY</span>).
        </div>
      </div>
    );
  }

  if (!id || Number.isNaN(id)) {
    return (
      <div className="p-6">
        <div className="theme-border border rounded-xl p-4 text-sm text-secondary">
          Invalid team id.
        </div>
      </div>
    );
  }

  const host = getHost(sport);

  let team: any = null;
  let venue: any = null;

  try {
    const json = await apiGetTeam(host, id, apiKey);
    const first = Array.isArray(json?.response) ? json.response[0] : null;
    team = first?.team ?? first ?? null;
    venue = first?.venue ?? null;
  } catch (e: any) {
    return (
      <div className="p-6">
        <div className="theme-border border rounded-xl p-4 text-sm text-red-500">
          {e?.message || "Failed to load team."}
        </div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="p-6">
        <div className="theme-border border rounded-xl p-4 text-sm text-secondary">Team not found.</div>
      </div>
    );
  }

  const name = team?.name || "Team";
  const logo = team?.logo;
  const country = team?.country;
  const founded = team?.founded;

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center justify-between gap-3 mb-4">
        <Link href={`/sports/${sport}/all/`} className="text-sm font-semibold text-blue-600 dark:text-blue-400">
          ← Back to {sport.toUpperCase()} scores
        </Link>
        <Link href={`/sports/${sport}/all/`} className="text-sm text-secondary hover:text-primary">
          Open all
        </Link>
      </div>

      <div className="theme-border border rounded-2xl p-4 md:p-6 theme-bg shadow-sm">
        <div className="flex items-center gap-4">
          {logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logo} alt="" className="w-14 h-14 rounded-xl object-contain bg-white/70" />
          ) : (
            <div className="w-14 h-14 rounded-xl theme-border border" />
          )}

          <div className="min-w-0">
            <h1 className="text-xl md:text-2xl font-bold text-primary truncate">{name}</h1>
            <div className="text-sm text-secondary">
              {country ? <span>{country}</span> : null}
              {founded ? <span>{country ? " • " : ""}Founded {founded}</span> : null}
              <span>{(country || founded) ? " • " : ""}{sport.toUpperCase()}</span>
            </div>
          </div>
        </div>

        {venue ? (
          <div className="mt-5 theme-border border rounded-xl p-4">
            <div className="text-xs font-bold uppercase tracking-wide text-secondary">Venue</div>
            <div className="mt-1 text-sm text-primary font-semibold">{venue?.name || "-"}</div>
            <div className="mt-1 text-sm text-secondary">
              {[venue?.city, venue?.address].filter(Boolean).join(" • ") || ""}
            </div>
            <div className="mt-1 text-sm text-secondary">
              {venue?.capacity ? `Capacity: ${venue.capacity}` : ""}
            </div>
          </div>
        ) : null}

        <div className="mt-5 text-xs text-secondary">
          Tip: open a match from search, or go to the league page to explore standings/fixtures.
        </div>
      </div>
    </div>
  );
}
