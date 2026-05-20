"use client";

import Script from "next/script";
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

  if (!appId) return null;

  function handleLoad() {
    if (typeof window === "undefined" || !window.plugSDK) return;

    const config: Record<string, unknown> = {
      app_id: appId,
    };

    // If the user is logged in, identify them so DevRev links
    // conversations to their account in your PLuG inbox.
    if (session?.user) {
      config.user_ref = session.user.email ?? session.user.id;
      if (session.user.name) config.display_name = session.user.name;
      if (session.user.email) config.user_email = session.user.email;
    }

    window.plugSDK.init(config);
  }

  return (
    <Script
      src="https://plug-platform.devrev.ai/static/plug.js"
      strategy="afterInteractive"
      onLoad={handleLoad}
    />
  );
}
