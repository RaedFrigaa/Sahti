import { CabinetList } from "@/components/cabinet-list";
import { SiteHeader } from "@/components/site-header";
import { getCabinets } from "@/lib/cabinet-service";

export default async function Home() {
  const cabinets = await getCabinets();

  return (
    <>
      <SiteHeader />
      <CabinetList cabinets={cabinets} />
    </>
  );
}
