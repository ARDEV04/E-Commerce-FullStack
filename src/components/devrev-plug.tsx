"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";

declare global {
  interface Window {
    plugSDK: {
      init: (config: Record<string, unknown>) => void;
      shutdown: () => void;
    };
  }
}

export function DevRevPlug() {
  const { data: session } = useSession();
  const appId = process.env.NEXT_PUBLIC_DEVREV_APP_ID;

  useEffect(() => {
    if (!appId || appId === "your-devrev-app-id") return;

    // Inject the PLuG script tag dynamically
    const existing = document.getElementById("devrev-plug-script");
    if (!existing) {
      const script = document.createElement("script");
      script.id = "devrev-plug-script";
      script.src = "https://plug-platform.devrev.ai/static/plug.js";
      script.async = true;
      document.body.appendChild(script);
    }

    // Poll until window.plugSDK is available, then init
    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      if (typeof window.plugSDK !== "undefined") {
        clearInterval(interval);

        const config: Record<string, unknown> = { app_id: appId };

        if (session?.user) {
          if (session.user.email) config.user_ref = session.user.email;
          if (session.user.name) config.display_name = session.user.name;
          if (session.user.email) config.user_email = session.user.email;
        }

        window.plugSDK.init(config);
      }
      // Give up after 10 seconds
      if (attempts > 100) clearInterval(interval);
    }, 100);

    return () => clearInterval(interval);
  }, [appId, session]);

  return null;
}
