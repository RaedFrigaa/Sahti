"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Logo, PrimaryButton } from "@/components/ui";
import { createClient } from "@/utils/supabase/client";

type Role = "admin" | "cabinet";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError || !data.user) {
      setError(signInError?.message ?? "Connexion impossible.");
      setLoading(false);
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();

    const role = profile?.role as Role | undefined;
    if (profileError || (role !== "admin" && role !== "cabinet")) {
      await supabase.auth.signOut();
      setError("Ce compte ne dispose pas d’un accès professionnel.");
      setLoading(false);
      return;
    }

    router.replace(role === "admin" ? "/admin" : "/cabinet");
    router.refresh();
  }

  return (
    <main className="grid min-h-screen place-items-center bg-brand-soft p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-2xl bg-white p-7 shadow-card">
        <Logo />
        <h1 className="mt-8 text-3xl font-bold">Espace professionnel</h1>
        <p className="mt-2">Connectez-vous avec le compte créé par l’administrateur.</p>
        <label className="mt-6 block font-bold">Adresse e-mail
          <input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1 min-h-11 w-full rounded-xl border border-brand-muted px-3" autoComplete="email" />
        </label>
        <label className="mt-4 block font-bold">Mot de passe
          <input required type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-1 min-h-11 w-full rounded-xl border border-brand-muted px-3" autoComplete="current-password" />
        </label>
        {error && <p role="alert" className="mt-4 text-sm font-semibold text-status-declined">{error}</p>}
        <PrimaryButton disabled={loading} className="mt-6 w-full">
          {loading ? <span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />Connexion…</span> : "Se connecter"}
        </PrimaryButton>
      </form>
    </main>
  );
}
