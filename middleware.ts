import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Middleware runs on every request; we'll only act for the root path ('/')
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  console.log("[middleware] incoming", { pathname, method: req.method });

  // Only check maintenance when the user visits the root page
  if (pathname !== "/") {
    return NextResponse.next();
  }

  try {
    // Always fetch fresh status from the API
    const res = await fetch("http://localhost:5157/api/maintenance/status", { cache: "no-store" });
    if (res.ok) {
      const json = await res.json();
      console.log("[middleware] maintenance api returned", json);
      const isOn = json?.isOn ?? json?.IsOn ?? false;
      if (isOn) {
        const maintenanceUrl = req.nextUrl.clone();
        maintenanceUrl.pathname = "/maintenance";
        maintenanceUrl.search = "";
        return NextResponse.redirect(maintenanceUrl);
      }
    }
  } catch (err) {
    // If the check fails, let the request continue so site remains available.
    // Do not block users when the maintenance API is unreachable.
  }

  return NextResponse.next();
}

export const config = {
  // Run middleware only for root ("/") — middleware code already guards, but keep default matcher active
  matcher: ["/"]
};
