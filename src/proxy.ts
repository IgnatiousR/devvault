import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "./lib/auth";

const GUEST_ONLY_ROUTES = ["/login", "/register", "/forgot-password"];

export async function proxy(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const pathname = new URL(request.url).pathname;

  if (session && GUEST_ONLY_ROUTES.includes(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (!session && !GUEST_ONLY_ROUTES.includes(pathname)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/profile", "/login", "/register", "/forgot-password"],
};
