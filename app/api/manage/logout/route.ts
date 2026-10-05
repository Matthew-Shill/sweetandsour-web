import { NextResponse } from "next/server";
import { managerCookie } from "@/lib/manage-auth";

export async function POST(request: Request) {
  const response = NextResponse.redirect(new URL("/manage", request.url), 303);
  response.cookies.set(managerCookie.name, "", { ...managerCookie.options, maxAge: 0 });
  return response;
}
