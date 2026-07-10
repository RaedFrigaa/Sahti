"use client";
import { useState } from "react";
import Link from "next/link";
import { PrimaryButton } from "./ui";

export function AppointmentButton({ cabinetId, cabinetName }: { cabinetId: string; cabinetName: string }) {
  const [open, setOpen] = useState(false);
  return <><PrimaryButton className="w-full" onClick={() => setOpen(true)}>Prendre rendez-vous</PrimaryButton>{open && <div role="dialog" aria-modal="true" aria-labelledby="appointment-title" className="fixed inset-0 z-50 grid place-items-center bg-brand-ink/60 p-4"><div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-card"><h2 id="appointment-title" className="text-2xl font-bold">Confirmer votre demande</h2><p className="mt-3 leading-7">Êtes-vous sûr de vouloir prendre rendez-vous avec <strong>{cabinetName}</strong> ?</p><div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><button className="min-h-11 rounded-xl px-4 font-bold hover:bg-brand-soft" onClick={() => setOpen(false)}>Annuler</button><Link href={`/confirmation?cabinet=${cabinetId}`} className="min-h-11 rounded-xl bg-brand-accent px-4 py-3 text-center font-bold">Confirmer</Link></div></div></div>}</>;
}
