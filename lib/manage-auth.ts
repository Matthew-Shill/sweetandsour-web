import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE = "sas_manage";

function sessionToken(password: string) {
  return createHmac("sha256", password).update("sweet-and-sour-manage-session").digest("hex");
}

export function passwordsMatch(input: string, expected: string) {
  const pepper = "sweet-and-sour-manage-v1";
  const left = createHmac("sha256", pepper).update(input).digest();
  const right = createHmac("sha256", pepper).update(expected).digest();
  return timingSafeEqual(left, right);
}

export function tokensMatch(cookie: string, password: string) {
  const expected = sessionToken(password);
  const left = Buffer.from(cookie);
  const right = Buffer.from(expected);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export function managerCookieValue(password: string) {
  return sessionToken(password);
}

export const managerCookie = {
  name: COOKIE,
  options: {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  },
};

export async function isManager() {
  const password = process.env.MANAGE_PASSWORD ?? "";
  if (!password) return false;
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value ?? "";
  if (!token) return false;
  return tokensMatch(token, password);
}
