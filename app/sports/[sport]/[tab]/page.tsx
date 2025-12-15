import { Suspense } from "react";
import { notFound } from "next/navigation";
import GameWidget from "@/components/widgets/GameWidget";
import { Skeleton } from "@/components/ui/Skeleton";

type Props = {
  params: Promise<{ sport: string; tab: string }>;
};

const VALID_TABS = ["all", "live", "today", "finished", "scheduled"] as const;

export default async function SportsTabPage({ params }: Props) {
  const { sport, tab } = await params;

  const sportKey = (sport || "").toLowerCase();
  const tabKey = (tab || "").toLowerCase();

  if (!sportKey) return notFound();
  if (!VALID_TABS.includes(tabKey as any)) return notFound();

  return (
    <div className="w-full min-h-screen theme-bg">
      <Suspense fallback={<Skeleton className="w-full h-[600px] rounded-xl" />}>
        <GameWidget sport={sportKey} initialTab={tabKey} />
      </Suspense>
    </div>
  );
}
