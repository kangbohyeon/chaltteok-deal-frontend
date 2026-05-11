import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const role = request.cookies.get("chaltteok-role")?.value;
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/login") && role !== "ROLE_OWNER") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|favicon.ico).*)"],
};
