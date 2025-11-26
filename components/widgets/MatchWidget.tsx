"use client";

import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/Skeleton";

export default function MatchWidget({ matchId }: { matchId: string }) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(false);
    const timer = setTimeout(() => setLoaded(true), 1000);
    return () => clearTimeout(timer);
  }, [matchId]);

  return (
    <div className="w-full h-full theme-bg flex flex-col text-primary">

      {/* SKELETON LOADING */}
      {!loaded && (
        <div className="p-4 space-y-4">
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      )}

      {/* API SPORTS WIDGET */}
      <div
        className={loaded ? "block h-full" : "hidden"}
        dangerouslySetInnerHTML={{
          __html: `
            <api-sports-widget 
              data-type="game"
              data-id="${matchId}"
              data-show-toolbar="false"
              data-theme="white"
            ></api-sports-widget>
          `,
        }}
      />
    </div>
  );
}
