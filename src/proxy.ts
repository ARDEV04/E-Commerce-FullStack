import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const pathname = req.nextUrl.pathname;
  const session = req.auth;
  const isLoggedIn = !!session?.user;
  const role = session?.user?.role as string | undefined;

  const loginUrl = new URL("/login", req.nextUrl.origin);
  loginUrl.searchParams.set("callbackUrl", pathname);

  if (pathname.startsWith("/admin")) {
    if (!isLoggedIn) return NextResponse.redirect(loginUrl);
    if (role !== "ADMIN") return NextResponse.redirect(new URL("/forbidden", req.nextUrl.origin));
  }

  if (pathname.startsWith("/seller") && !pathname.startsWith("/seller/apply")) {
    if (!isLoggedIn) return NextResponse.redirect(loginUrl);
    if (role !== "SELLER" && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/seller/apply", req.nextUrl.origin));
    }
  }

  const protectedPaths = ["/profile", "/orders", "/checkout"];
  if (protectedPaths.some((p) => pathname.startsWith(p))) {
    if (!isLoggedIn) return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
