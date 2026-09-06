import { readMenuData } from "@/lib/menu";
import { MenuView } from "@/components/menu/MenuView";

export default async function Home() {
  const data = await readMenuData();
  return <MenuView initialData={data} />;
}
