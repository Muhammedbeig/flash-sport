import PlayerProfile from "@/components/player/PlayerProfile";

type Props = {
  params: Promise<{ sport: string; id: string }>;
};

export default async function PlayerPage({ params }: Props) {
  const { sport, id } = await params;
  return <PlayerProfile sport={sport} id={id} />;
}
