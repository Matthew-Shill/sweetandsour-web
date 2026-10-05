import { NextResponse } from "next/server";
import { isManager } from "@/lib/manage-auth";
import { parseMenu, saveMenu } from "@/lib/content";

function saveMessage(error: unknown) {
  const code =
    typeof error === "object" && error && "code" in error
      ? String((error as { code: unknown }).code)
      : "";
  if (code === "EROFS" || code === "EACCES" || code === "EPERM") {
    return "This server cannot save file changes. Edit content/menu.json and republish.";
  }
  return error instanceof Error ? error.message : "The menu was not saved.";
}

export async function POST(request: Request) {
  if (!(await isManager())) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "The menu could not be read." }, { status: 400 });
  }

  try {
    await saveMenu(parseMenu(body));
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: saveMessage(error) }, { status: 400 });
  }
}
