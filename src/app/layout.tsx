import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/lib/auth";
import { DevRevPlug } from "@/components/devrev-plug";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "ShopHub – Your One-Stop Marketplace",
    template: "%s | ShopHub",
  },
  description:
    "Discover thousands of products from verified sellers. Shop electronics, fashion, home goods and more.",
  keywords: ["ecommerce", "marketplace", "shop", "buy online"],
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider session={session}>
          {children}
          <Toaster richColors position="top-right" />
          <DevRevPlug />
        </SessionProvider>
      </body>
    </html>
  );
}
