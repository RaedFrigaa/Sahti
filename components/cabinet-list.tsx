"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { MapPin, Search, X } from "lucide-react";
import { wilayas } from "@/lib/mock-data";
import type { Cabinet } from "@/lib/cabinet-service";
import { PrimaryButton, Stars } from "./ui";

const specialties = [
  "Médecine générale",
  "Cardiologie",
  "Dermatologie",
  "Pédiatrie",
  "Gynécologie",
  "Ophtalmologie",
  "ORL",
  "Neurologie",
  "Endocrinologie",
];

export function CabinetList({ cabinets }: { cabinets: Cabinet[] }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [wilaya, setWilaya] = useState("");
  const [sort, setSort] = useState("");
  const [selected, setSelected] = useState<Cabinet | null>(null);

  const filtered = useMemo(() => {
    const results = cabinets.filter((cabinet) => {
      const query = search.toLowerCase();
      return (
        (!query ||
          cabinet.name.toLowerCase().includes(query) ||
          cabinet.specialty.toLowerCase().includes(query)) &&
        (!category || cabinet.category === category) &&
        (!specialty || cabinet.specialty === specialty) &&
        (!wilaya || cabinet.wilaya === wilaya)
      );
    });
    return results.sort((a, b) =>
      sort === "rating"
        ? b.rating - a.rating
        : sort === "price"
          ? a.price - b.price
          : 0,
    );
  }, [search, category, specialty, wilaya, sort]);

  function reset() {
    setSearch("");
    setCategory("");
    setSpecialty("");
    setWilaya("");
    setSort("");
  }

  return (
    <>
      <section className="bg-brand-soft">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
          <p className="mb-3 font-bold text-brand-secondary">
            Votre santé, simplement
          </p>
          <h1 className="max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
            Trouvez le bon professionnel de santé près de chez vous.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-8">
            Choisissez un cabinet, faites votre demande et l’assistance du
            cabinet vous rappelle directement.
          </p>
          <div className="mt-8 grid gap-3 rounded-2xl bg-white p-4 shadow-card md:grid-cols-2 xl:grid-cols-4">
            <label className="relative">
              <span className="sr-only">
                Rechercher un médecin ou un cabinet
              </span>
              <Search className="absolute left-3 top-3 h-5 w-5" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="min-h-11 w-full rounded-xl border border-brand-muted pl-10 pr-3"
                placeholder="Rechercher un médecin ou cabinet"
              />
            </label>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setSpecialty("");
              }}
              className="min-h-11 rounded-xl border border-brand-muted px-3">
              <option value="">Toutes les catégories</option>
              <option>Dentiste</option>
              <option>Médecin</option>
              <option>Psychologue</option>
            </select>
            {category === "Médecin" && (
              <select
                aria-label="Spécialité médicale"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                className="min-h-11 rounded-xl border border-brand-muted px-3">
                <option value="">Toutes les spécialités</option>
                {specialties.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            )}
            <select
              value={wilaya}
              onChange={(e) => setWilaya(e.target.value)}
              className="min-h-11 rounded-xl border border-brand-muted px-3">
              <option value="">Toutes les wilayas</option>
              {wilayas.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
            <select
              aria-label="Trier les cabinets"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="min-h-11 rounded-xl border border-brand-muted px-3">
              <option value="">Trier par</option>
              <option value="rating">Notes</option>
              <option value="price">Prix</option>
              <option value="distance">Plus proche</option>
            </select>
          </div>
        </div>
      </section>
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            {filtered.length} cabinets disponibles
          </h2>
          {(search || category || specialty || wilaya || sort) && (
            <button
              onClick={reset}
              className="inline-flex items-center gap-1 font-bold text-brand-secondary">
              <X className="h-4 w-4" /> Réinitialiser
            </button>
          )}
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((cabinet) => (
            <article
              key={cabinet.id}
              className="overflow-hidden rounded-2xl bg-white shadow-card">
              <Link href={`/cabinets/${cabinet.id}`} className="block">
                <img
                  src={cabinet.image}
                  alt={`Cabinet ${cabinet.name}`}
                  className="h-48 w-full object-cover"
                />
                <div className="p-5">
                  <div className="flex justify-between gap-3">
                    <h3 className="text-xl font-bold">{cabinet.name}</h3>
                    <Stars rating={cabinet.rating} />
                  </div>
                  <p className="mt-2 font-semibold text-brand-secondary">
                    {cabinet.category} · {cabinet.specialty}
                  </p>
                  <p className="mt-3 flex items-start gap-2 text-sm">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-muted" />
                    {cabinet.address}
                  </p>
                </div>
              </Link>
              <div className="px-5 pb-5">
                <PrimaryButton
                  className="w-full"
                  onClick={() => setSelected(cabinet)}>
                  Prendre rendez-vous
                </PrimaryButton>
              </div>
            </article>
          ))}
        </div>
        {filtered.length === 0 && (
          <p className="rounded-xl bg-brand-soft p-6 text-center">
            Aucun cabinet ne correspond à votre recherche.
          </p>
        )}
      </main>
      {selected && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          className="fixed inset-0 z-50 grid place-items-center bg-brand-ink/60 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-card">
            <h2 id="modal-title" className="text-2xl font-bold">
              Confirmer votre demande
            </h2>
            <p className="mt-3 leading-7">
              Êtes-vous sûr de vouloir prendre rendez-vous avec{" "}
              <strong>{selected.name}</strong> ?
            </p>
            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                className="min-h-11 rounded-xl px-4 font-bold hover:bg-brand-soft"
                onClick={() => setSelected(null)}>
                Annuler
              </button>
              <Link
                href={`/confirmation?cabinet=${selected.id}`}
                className="min-h-11 rounded-xl bg-brand-accent px-4 py-3 text-center font-bold">
                Confirmer
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
