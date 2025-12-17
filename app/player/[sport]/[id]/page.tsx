import PlayerProfile from "@/components/player/PlayerProfile";

type PageProps = {
  params: Promise<{ sport: string; id: string }>;
};

export default async function PlayerPage({ params }: PageProps) {
  const { sport, id } = await params;

  // PlayerProfile is a client component. We pass sport/id directly (path based).
  return <PlayerProfile sport={sport} id={id} />;
}
