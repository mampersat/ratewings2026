import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const COOKIE = "rw_uid";
const ONE_YEAR = 60 * 60 * 24 * 365;

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  if (!request.cookies.get(COOKIE)) {
    response.cookies.set(COOKIE, crypto.randomUUID(), {
      httpOnly: true,
      sameSite: "lax",
      maxAge: ONE_YEAR,
      path: "/",
    });
  }

  return response;
}
