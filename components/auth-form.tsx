"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase";
import { PrimaryButton } from "./ui";

function normalizePhone(phone: string) {
  return phone.replace(/[\s-]/g, "").trim();
}

export function AuthForm() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [step, setStep] = useState<"request" | "verify">("request");
  const [phone, setPhone] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function requestCode(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    const supabase = getSupabaseClient();

    if (!supabase) {
      setLoading(false);
      setError("Configure les variables Supabase avant d'envoyer un code SMS.");
      return;
    }

    const { error: otpError } = await supabase.auth.signInWithOtp({
      phone: normalizePhone(phone),
      options: {
        shouldCreateUser: true,
        data:
          mode === "signup"
            ? { first_name: firstName, last_name: lastName, role: "patient" }
            : { role: "patient" },
      },
    });

    setLoading(false);

    if (otpError) {
      setError(otpError.message);
      return;
    }

    setStep("verify");
    setMessage("Un code de vérification a été envoyé à votre numéro.");
  }

  async function verifyCode(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    const supabase = getSupabaseClient();

    if (!supabase) {
      setLoading(false);
      setError("Configure les variables Supabase avant de vérifier le code.");
      return;
    }

    const { error: verifyError } = await supabase.auth.verifyOtp({
      phone: normalizePhone(phone),
      token: code,
      type: "sms",
    });

    setLoading(false);

    if (verifyError) {
      setError(verifyError.message);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-md rounded-2xl bg-white p-6 shadow-card">
      <div className="mb-6 flex rounded-xl bg-brand-soft p-1">
        <button
          type="button"
          onClick={() => {
            setMode("login");
            setStep("request");
            setError("");
            setMessage("");
          }}
          className={`min-h-11 flex-1 rounded-lg font-bold ${mode === "login" ? "bg-white" : ""}`}>
          Connexion
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("signup");
            setStep("request");
            setError("");
            setMessage("");
          }}
          className={`min-h-11 flex-1 rounded-lg font-bold ${mode === "signup" ? "bg-white" : ""}`}>
          Inscription
        </button>
      </div>
      {step === "request" ? (
        <form onSubmit={requestCode} className="space-y-4">
          {mode === "signup" && (
            <>
              <label className="block font-bold">
                Nom
                <input
                  required
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                  className="mt-1 min-h-11 w-full rounded-xl border border-brand-muted px-3"
                />
              </label>
              <label className="block font-bold">
                Prénom
                <input
                  required
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  className="mt-1 min-h-11 w-full rounded-xl border border-brand-muted px-3"
                />
              </label>
            </>
          )}
          <label className="block font-bold">
            Numéro de téléphone
            <input
              required
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              type="tel"
              placeholder="0550 00 00 00"
              className="mt-1 min-h-11 w-full rounded-xl border border-brand-muted px-3"
            />
          </label>
          <PrimaryButton className="w-full" disabled={loading}>
            {loading ? "Envoi en cours..." : "Recevoir un code SMS"}
          </PrimaryButton>
        </form>
      ) : (
        <form onSubmit={verifyCode} className="space-y-4">
          <p>Entrez le code reçu par SMS pour activer votre compte.</p>
          <label className="block font-bold">
            Code SMS
            <input
              required
              value={code}
              onChange={(event) => setCode(event.target.value)}
              pattern="[0-9]{4,6}"
              title="Saisissez 4 à 6 chiffres"
              inputMode="numeric"
              placeholder="1234"
              className="mt-1 min-h-11 w-full rounded-xl border border-brand-muted px-3"
            />
          </label>
          <PrimaryButton className="w-full" disabled={loading}>
            {loading ? "Vérification..." : "Valider le code"}
          </PrimaryButton>
        </form>
      )}
      {message && (
        <p
          role="status"
          className="mt-5 rounded-xl bg-status-confirmed-bg p-4 font-semibold text-status-confirmed">
          {message}
        </p>
      )}
      {error && (
        <p
          role="alert"
          className="mt-5 rounded-xl bg-red-50 p-4 font-semibold text-status-declined">
          {error}
        </p>
      )}
    </div>
  );
}
