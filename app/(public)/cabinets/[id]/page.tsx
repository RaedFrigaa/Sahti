import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { Stars } from "@/components/ui";
import { AppointmentButton } from "@/components/appointment-button";
import { getCabinetById } from "@/lib/cabinet-service";

export default async function CabinetDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cabinet = await getCabinetById(id);

  if (!cabinet) {
    notFound();
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <Link href="/" className="font-bold text-brand-secondary">
          ← Retour aux cabinets
        </Link>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <img
            src={cabinet.gallery[0]}
            alt={`Façade ${cabinet.name}`}
            className="h-72 w-full rounded-2xl object-cover sm:row-span-2 sm:h-full"
          />
          {cabinet.gallery.slice(1).map((image, i) => (
            <img
              key={image}
              src={image}
              alt={`Cabinet ${cabinet.name}, photo ${i + 2}`}
              className="h-36 w-full rounded-2xl object-cover"
            />
          ))}
        </div>
        <section className="mt-8 grid gap-8 lg:grid-cols-[1fr_280px]">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-bold text-brand-secondary">
                  {cabinet.category} · {cabinet.specialty}
                </p>
                <h1 className="mt-1 text-4xl font-bold">{cabinet.name}</h1>
              </div>
              <Stars rating={cabinet.rating} />
            </div>
            <p className="mt-6 text-lg leading-8">{cabinet.description}</p>
            <div className="mt-6 space-y-3 rounded-2xl bg-brand-soft p-5">
              <p className="flex gap-3">
                <MapPin className="shrink-0" />
                {cabinet.address}, {cabinet.wilaya}
              </p>
              <p className="font-bold text-brand-ink">
                Prix de la consultation :{" "}
                {cabinet.price.toLocaleString("fr-FR")} DA
              </p>
            </div>
            <h2 className="mt-10 text-2xl font-bold">Avis des patients</h2>
            <div className="mt-4 space-y-4">
              {cabinet.reviews.map((r) => (
                <article
                  key={r.id}
                  className="rounded-xl border border-brand-soft p-4">
                  <div className="flex justify-between">
                    <strong>{r.patient}</strong>
                    <Stars rating={r.rating} />
                  </div>
                  <p className="mt-2">{r.comment}</p>
                </article>
              ))}
            </div>
          </div>
          <aside className="h-fit rounded-2xl bg-white p-5 shadow-card">
            <h2 className="text-xl font-bold">Demander un rendez-vous</h2>
            <p className="mt-2 text-sm leading-6">
              Le cabinet vous contactera pour convenir d’un créneau.
            </p>
            <div className="mt-5">
              <AppointmentButton
                cabinetId={cabinet.id}
                cabinetName={cabinet.name}
              />
            </div>
          </aside>
        </section>
      </main>
    </>
  );
}
