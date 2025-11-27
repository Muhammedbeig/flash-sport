"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export default function WidgetScriptLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Function to hard-reload the external script
    const loadScript = () => {
      // 1. Remove existing script if present (resets the engine)
      const existingScript = document.getElementById("api-sports-script");
      if (existingScript) {
        existingScript.remove();
      }

      // 2. Create and append the new script
      const script = document.createElement("script");
      script.id = "api-sports-script";
      script.src = "https://widgets.api-sports.io/3.1.0/widgets.js";
      script.type = "module";
      script.async = true;
      document.body.appendChild(script);
    };

    // Trigger load immediately and on any route change
    loadScript();

  }, [pathname, searchParams]); 

  return null;
}