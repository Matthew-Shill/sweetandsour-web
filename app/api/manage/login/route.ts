import { NextResponse } from "next/server";
import { managerCookie, managerCookieValue, passwordsMatch } from "@/lib/manage-auth";

export async function POST(request: Request) {
  const expected = process.env.MANAGE_PASSWORD ?? "";
  let password = "";
  try {
    const body = (await request.json()) as { password?: unknown };
    password = typeof body.password === "string" ? body.password : "";
  } catch {
    password = "";
  }

  if (!expected || !passwordsMatch(password, expected)) {
    return NextResponse.json({ error: "That password did not match." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(managerCookie.name, managerCookieValue(expected), managerCookie.options);
  return response;
}
