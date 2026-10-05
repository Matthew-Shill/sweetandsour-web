import { NextResponse } from "next/server";
import { parseSettings, saveSettings } from "@/lib/content";
import { isManager } from "@/lib/manage-auth";

function saveMessage(error: unknown) {
  const code =
    typeof error === "object" && error && "code" in error
      ? String((error as { code: unknown }).code)
      : "";
  if (code === "EROFS" || code === "EACCES" || code === "EPERM") {
    return "This server cannot save file changes. Edit content/settings.json and republish.";
  }
  return error instanceof Error ? error.message : "Settings were not saved.";
}

export async function POST(request: Request) {
  if (!(await isManager())) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Settings could not be read." }, { status: 400 });
  }

  try {
    await saveSettings(parseSettings(body));
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: saveMessage(error) }, { status: 400 });
  }
}
