import { randomBytes } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { isManager } from "@/lib/manage-auth";

export async function POST(request: Request) {
  if (!(await isManager())) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const form = await request.formData();
  const file = form.get("file");
  const productId = String(form.get("productId") ?? "dessert");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Choose a photo." }, { status: 400 });
  }
  if (file.size > 3_000_000) {
    return NextResponse.json({ error: "Use a photo under 3 MB." }, { status: 400 });
  }

  const extension =
    file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : file.type === "image/jpeg" ? "jpg" : "";
  if (!extension) {
    return NextResponse.json({ error: "Use a JPG, PNG, or WebP photo." }, { status: 400 });
  }

  const slug = productId.toLowerCase().replace(/[^a-z0-9-]+/g, "").slice(0, 40) || "dessert";
  const filename = `${slug}-${randomBytes(4).toString("hex")}.${extension}`;
  const directory = path.join(process.cwd(), "public", "menu");
  const destination = path.join(directory, filename);
  if (!destination.startsWith(`${directory}${path.sep}`)) {
    return NextResponse.json({ error: "That file name is not allowed." }, { status: 400 });
  }

  await mkdir(directory, { recursive: true });
  await writeFile(destination, Buffer.from(await file.arrayBuffer()));
  return NextResponse.json({ path: `/menu/${filename}` });
}
