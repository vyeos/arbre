import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Allow public paths
  const publicPaths = ["/", "/demo", "/login", "/signup", "/api"];
  const path = request.nextUrl.pathname;

  if (publicPaths.some((p) => path === p || path.startsWith(`${p}/`))) {
    return NextResponse.next();
  }

  // For protected routes, let the app handle auth checks
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
