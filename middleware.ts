import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { API_URL } from "./src/lib/config";

// Middleware runs on every request; we'll only act for the root path ('/')
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  console.log("[middleware] incoming", { pathname, method: req.method });

  if (pathname !== "/") {
    return NextResponse.next();
  }

  // Maintenance check disabled
  // try {
  //   const res = await fetch(`${API_URL}/api/maintenance/status`, { cache: "no-store" });
  //   if (res.ok) {
  //     const json = await res.json();
  //     const isOn = json?.isOn ?? json?.IsOn ?? false;
  //     if (isOn) {
  //       const maintenanceUrl = req.nextUrl.clone();
  //       maintenanceUrl.pathname = "/maintenance";
  //       maintenanceUrl.search = "";
  //       return NextResponse.redirect(maintenanceUrl);
  //     }
  //   }
  // } catch (err) {}

  return NextResponse.next();
}

export const config = {
  // Run middleware only for root ("/") — middleware code already guards, but keep default matcher active
  matcher: ["/"]
};
