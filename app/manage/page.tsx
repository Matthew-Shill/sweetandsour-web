import type { Metadata } from "next";
import { connection } from "next/server";
import { ManageEditor, ManageLogin } from "@/components/manage-editor";
import { loadMenu, loadSettings } from "@/lib/content";
import { isManager } from "@/lib/manage-auth";

export const metadata: Metadata = {
  title: "Menu editor",
  robots: { index: false, follow: false },
};

export default async function ManagePage() {
  await connection();
  const password = process.env.MANAGE_PASSWORD ?? "";

  return (
    <div className="px-5 py-14 sm:px-8 sm:py-20">
      <div className="mx-auto max-w-4xl">
        <p className="eyebrow">For the bakery</p>
        <h1 className="mt-3 font-display text-5xl font-medium">Menu editor</h1>
        <p className="mt-5 max-w-2xl leading-7">
          Update photos, descriptions, prices, and availability here. Photos replace the drawings.
          Put image files in public/menu, or upload them below. The same details live in
          content/menu.json and content/settings.json if you would rather edit the files and
          republish.
        </p>
        {!password ? (
          <p className="mt-8 max-w-xl leading-7">
            The editor is locked until MANAGE_PASSWORD is set in the server environment.
          </p>
        ) : (await isManager()) ? (
          <div className="mt-10">
            <Editor />
          </div>
        ) : (
          <div className="mt-10">
            <ManageLogin />
          </div>
        )}
      </div>
    </div>
  );
}

async function Editor() {
  const [menu, settings] = await Promise.all([loadMenu(), loadSettings()]);
  return <ManageEditor menu={menu} settings={settings} />;
}
