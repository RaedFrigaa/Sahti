"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";
import { getSupabaseClient } from "@/lib/supabase";
import type { Cabinet } from "@/lib/cabinet-service";

export function ConfirmationPanel({ cabinet }: { cabinet: Cabinet }) {
  const router = useRouter();
  const [status, setStatus] = useState<
    "idle" | "checking" | "ready" | "done" | "error"
  >("checking");
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const supabase = getSupabaseClient();

    if (!supabase) {
      setStatus("error");
      setMessage(
        "Variables Supabase manquantes. Configure l'environnement puis réessaie.",
      );
      return;
    }

    supabase.auth.getUser().then(({ data, error }) => {
      if (error || !data.user) {
        setStatus("error");
        setMessage("Tu dois te connecter avant de confirmer un rendez-vous.");
        return;
      }

      setStatus("ready");
    });
  }, []);

  function redirectToAuth() {
    router.push("/auth");
  }

  function confirmAppointment() {
    startTransition(async () => {
      const supabase = getSupabaseClient();

      if (!supabase) {
        setStatus("error");
        setMessage("Variables Supabase manquantes.");
        return;
      }

      const { data: userData, error: userError } =
        await supabase.auth.getUser();

      if (userError || !userData.user) {
        setStatus("error");
        setMessage("Tu dois te connecter avant de confirmer un rendez-vous.");
        return;
      }

      const { error: insertError } = await supabase
        .from("appointments")
        .insert({
          patient_id: userData.user.id,
          cabinet_id: cabinet.id,
          status: "pending",
        });

      if (insertError) {
        setStatus("error");
        setMessage(insertError.message);
        return;
      }

      setStatus("done");
      setMessage("Votre demande de rendez-vous a bien été enregistrée.");
    });
  }

  return (
    <main className="mx-auto max-w-xl px-4 py-20 text-center">
      <CheckCircle2 className="mx-auto h-16 w-16 text-status-confirmed" />
      <h1 className="mt-6 text-3xl font-bold">Confirmer votre demande</h1>
      <p className="mt-4 text-lg leading-8">
        L’assistance de <strong>{cabinet.name}</strong> recevra votre demande de
        rendez-vous.
      </p>
      <div className="mt-8 rounded-2xl bg-white p-6 shadow-card">
        <p className="font-semibold">
          {status === "checking"
            ? "Vérification de votre session..."
            : message || "Cliquez ci-dessous pour enregistrer la demande."}
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          {status === "error" ? (
            <button
              type="button"
              onClick={redirectToAuth}
              className="min-h-11 rounded-xl bg-brand-accent px-5 py-3 font-bold text-brand-ink">
              Se connecter
            </button>
          ) : (
            <button
              type="button"
              onClick={confirmAppointment}
              disabled={status !== "ready" || isPending}
              className="min-h-11 rounded-xl bg-brand-accent px-5 py-3 font-bold text-brand-ink disabled:cursor-not-allowed disabled:opacity-60">
              {isPending ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Confirmation...
                </span>
              ) : status === "done" ? (
                "Demande enregistrée"
              ) : (
                "Confirmer le rendez-vous"
              )}
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
