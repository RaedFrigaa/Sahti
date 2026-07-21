import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { getCabinets } from "@/lib/cabinet-service";
import { ConfirmationPanel } from "@/components/confirmation-panel";

export default async function Confirmation({
  searchParams,
}: {
  searchParams: Promise<{ cabinet?: string }>;
}) {
  const { cabinet } = await searchParams;
  const cabinets = await getCabinets();
  const selectedCabinet =
    cabinets.find((item) => item.id === cabinet) ?? cabinets[0];

  return (
    <>
      <SiteHeader />
      <ConfirmationPanel cabinet={selectedCabinet} />
      <div className="-mt-10 text-center">
        <Link
          href="/"
          className="rounded-xl bg-brand-accent px-5 py-3 font-bold">
          Retour à l’accueil
        </Link>
      </div>
    </>
  );
}
