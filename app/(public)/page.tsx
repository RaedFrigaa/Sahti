import { CabinetList } from "@/components/cabinet-list";
import { SiteHeader } from "@/components/site-header";
import { getCabinets } from "@/lib/cabinet-service";

// Les cabinets sont administrés en temps réel : ne pas figer la liste au build.
export const dynamic = "force-dynamic";

export default async function Home() {
  const cabinets = await getCabinets();

  return (
    <>
      <SiteHeader />
      <CabinetList cabinets={cabinets} />
    </>
  );
}
