"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase";
import { StatusBadge } from "@/components/ui";

type HistoryItem = {
  id: string;
  cabinetName: string;
  status: "pending" | "confirmed" | "declined";
};

export function HistoryPanel() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const supabase = getSupabaseClient();

    if (!supabase) {
      setMessage("Configure Supabase pour afficher l'historique patient.");
      setLoading(false);
      return;
    }

    supabase.auth.getUser().then(async ({ data, error }) => {
      if (error || !data.user) {
        setMessage("Connecte-toi pour voir ton historique de rendez-vous.");
        setLoading(false);
        return;
      }

      const [
        { data: appointments, error: appointmentError },
        { data: cabinets, error: cabinetError },
      ] = await Promise.all([
        supabase
          .from("appointments")
          .select("id, cabinet_id, status")
          .eq("patient_id", data.user.id)
          .order("created_at", { ascending: false }),
        supabase.from("cabinets").select("id, name"),
      ]);

      if (appointmentError || cabinetError) {
        setMessage("Impossible de charger l'historique pour le moment.");
        setLoading(false);
        return;
      }

      const cabinetNames = new Map(
        (cabinets ?? []).map((cabinet) => [cabinet.id, cabinet.name]),
      );

      setItems(
        (appointments ?? []).map((appointment) => ({
          id: appointment.id,
          cabinetName:
            cabinetNames.get(appointment.cabinet_id) ?? "Cabinet inconnu",
          status: appointment.status,
        })),
      );
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <p className="mt-7 rounded-2xl bg-white p-5 shadow-card">
        Chargement de votre historique...
      </p>
    );
  }

  return (
    <div className="mt-7 space-y-4">
      {message ? (
        <p className="rounded-2xl bg-white p-5 shadow-card">
          {message}{" "}
          <Link href="/auth" className="font-bold text-brand-secondary">
            Aller à la connexion
          </Link>
        </p>
      ) : items.length === 0 ? (
        <p className="rounded-2xl bg-white p-5 shadow-card">
          Aucun rendez-vous enregistré pour le moment.
        </p>
      ) : (
        items.map((item) => (
          <article
            key={item.id}
            className="flex flex-col justify-between gap-3 rounded-2xl bg-white p-5 shadow-card sm:flex-row sm:items-center">
            <div>
              <h2 className="text-xl font-bold">{item.cabinetName}</h2>
              <p className="mt-1">Votre demande est en cours de traitement.</p>
            </div>
            <StatusBadge status={item.status} />
          </article>
        ))
      )}
    </div>
  );
}
