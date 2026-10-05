import { connection } from "next/server";
import { HomePage } from "@/components/home-page";
import { loadMenu, loadSettings } from "@/lib/content";

export default async function Page() {
  await connection();
  const [menu, settings] = await Promise.all([loadMenu(), loadSettings()]);
  return <HomePage menu={menu} settings={settings} />;
}
