"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Building2, CalendarCheck, MessageSquareWarning, Plus, Save, Trash2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { StatusBadge } from "./ui";

type Tab = "cabinets" | "reviews" | "appointments";
type Cabinet = { id: string; name: string; category: string; specialty: string; wilaya: string; address: string; phone: string; consultation_price: number; description: string | null; owner_id: string | null };
type Review = { id: string; cabinet_id: string; rating: number; comment: string; status: "pending" | "published" | "hidden"; reported: boolean; cabinets: { name: string } | null };
type Appointment = { id: string; patient_id: string; status: "pending" | "confirmed" | "declined"; created_at: string; cabinets: { name: string } | null };
const emptyCabinet = { name: "", category: "Médecin", specialty: "", wilaya: "", address: "", phone: "", consultation_price: "", description: "", owner_id: "" };

export function AdminDashboard() {
  const [tab, setTab] = useState<Tab>("cabinets");
  const [cabinets, setCabinets] = useState<Cabinet[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [form, setForm] = useState(emptyCabinet);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [openForm, setOpenForm] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const supabase = createClient();
    const [cabinetResult, reviewResult, appointmentResult] = await Promise.all([
      supabase.from("cabinets").select("id, name, category, specialty, wilaya, address, phone, consultation_price, description, owner_id").order("created_at", { ascending: false }),
      supabase.from("reviews").select("id, cabinet_id, rating, comment, status, reported, cabinets(name)").order("created_at", { ascending: false }),
      supabase.from("appointments").select("id, patient_id, status, created_at, cabinets(name)").order("created_at", { ascending: false }),
    ]);
    const error = cabinetResult.error || reviewResult.error || appointmentResult.error;
    if (error) setMessage(error.message);
    else {
      setCabinets((cabinetResult.data ?? []) as Cabinet[]);
      setReviews((reviewResult.data ?? []) as unknown as Review[]);
      setAppointments((appointmentResult.data ?? []) as unknown as Appointment[]);
    }
    setLoading(false);
  }

  useEffect(() => { void load(); }, []);

  async function saveCabinet(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const payload = { ...form, owner_id: form.owner_id || null, consultation_price: Number(form.consultation_price) };
    const supabase = createClient();
    const result = editingId ? await supabase.from("cabinets").update(payload).eq("id", editingId) : await supabase.from("cabinets").insert(payload);
    if (result.error) { setMessage(result.error.message); return; }
    setMessage(editingId ? "Cabinet mis à jour." : "Cabinet ajouté à Supabase.");
    setOpenForm(false); setEditingId(null); setForm(emptyCabinet); void load();
  }

  async function deleteCabinet(id: string) {
    if (!window.confirm("Supprimer ce cabinet ? Cette action est irréversible.")) return;
    const { error } = await createClient().from("cabinets").delete().eq("id", id);
    setMessage(error ? error.message : "Cabinet supprimé.");
    if (!error) void load();
  }

  async function setReviewStatus(id: string, status: "published" | "hidden") {
    const { error } = await createClient().from("reviews").update({ status, reported: false }).eq("id", id);
    setMessage(error ? error.message : "Avis mis à jour.");
    if (!error) void load();
  }

  const tabs: [Tab, string, React.ElementType][] = [["cabinets", "Gestion des cabinets", Building2], ["reviews", "Modération des avis", MessageSquareWarning], ["appointments", "Suivi des RDV", CalendarCheck]];
  const reportedReviews = useMemo(() => reviews.filter((review) => review.reported || review.status === "pending"), [reviews]);

  return <div className="min-h-screen bg-brand-soft md:flex"><aside className="bg-brand-ink p-4 text-white md:min-h-screen md:w-72"><div className="text-2xl font-bold">sahti<span className="text-brand-accent">.</span> Admin</div><nav className="mt-8 flex gap-2 overflow-auto md:block">{tabs.map(([key, label, Icon]) => <button key={key} onClick={() => setTab(key)} className={`mb-2 flex min-h-11 shrink-0 items-center gap-3 rounded-xl px-4 py-3 text-left font-bold md:w-full ${tab === key ? "bg-brand-accent text-brand-ink" : "hover:bg-white/10"}`}><Icon className="h-5 w-5" />{label}</button>)}</nav></aside><main className="flex-1 p-4 sm:p-8"><h1 className="text-3xl font-bold">{tabs.find((item) => item[0] === tab)?.[1]}</h1>{message && <p role="status" className="mt-4 rounded-xl bg-white p-3 font-semibold">{message}</p>}{loading ? <p className="mt-6">Chargement des données Supabase…</p> : <>
    {tab === "cabinets" && <section className="mt-6 rounded-2xl bg-white p-5 shadow-card"><div className="flex items-center justify-between"><h2 className="text-xl font-bold">{cabinets.length} cabinets</h2><button onClick={() => { setForm(emptyCabinet); setEditingId(null); setOpenForm(true); }} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-brand-accent px-4 font-bold"><Plus className="h-4 w-4" />Ajouter</button></div>{openForm && <form onSubmit={saveCabinet} className="mt-5 grid gap-3 border-t pt-5 sm:grid-cols-2">{Object.entries(form).map(([key, value]) => <label key={key} className={key === "description" ? "sm:col-span-2" : ""}><span className="text-sm font-bold">{key === "consultation_price" ? "Prix consultation" : key === "owner_id" ? "ID utilisateur du cabinet (UUID)" : key}</span><input required={key !== "description" && key !== "owner_id"} type={key === "consultation_price" ? "number" : "text"} value={value} onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))} className="mt-1 min-h-11 w-full rounded-lg border px-3" /></label>)}<div className="flex gap-2 sm:col-span-2"><button className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-brand-ink px-4 font-bold text-white"><Save className="h-4 w-4" />Enregistrer</button><button type="button" onClick={() => setOpenForm(false)} className="min-h-11 px-4 font-bold">Annuler</button></div></form>}<div className="mt-4 overflow-x-auto"><table className="w-full text-left"><thead><tr className="border-b"><th className="p-3">Cabinet</th><th className="p-3">Catégorie</th><th className="p-3">Wilaya</th><th className="p-3">Actions</th></tr></thead><tbody>{cabinets.map((cabinet) => <tr key={cabinet.id} className="border-b border-brand-soft"><td className="p-3 font-bold">{cabinet.name}</td><td className="p-3">{cabinet.category}</td><td className="p-3">{cabinet.wilaya}</td><td className="p-3"><button onClick={() => { setEditingId(cabinet.id); setForm({ ...cabinet, consultation_price: String(cabinet.consultation_price), description: cabinet.description ?? "", owner_id: cabinet.owner_id ?? "" }); setOpenForm(true); }} className="mr-3 font-bold text-brand-secondary">Modifier</button><button onClick={() => void deleteCabinet(cabinet.id)} className="inline-flex items-center gap-1 font-bold text-status-declined"><Trash2 className="h-4 w-4" />Supprimer</button></td></tr>)}</tbody></table></div></section>}
    {tab === "reviews" && <section className="mt-6 space-y-3">{reportedReviews.length === 0 ? <p>Aucun avis à modérer.</p> : reportedReviews.map((review) => <article key={review.id} className="rounded-2xl bg-white p-5 shadow-card"><strong>{review.cabinets?.name ?? "Cabinet"} — {review.rating}/5</strong><p className="mt-2">{review.comment}</p><div className="mt-4 flex gap-2"><button onClick={() => void setReviewStatus(review.id, "hidden")} className="min-h-11 rounded-xl bg-red-50 px-4 font-bold text-status-declined">Masquer</button><button onClick={() => void setReviewStatus(review.id, "published")} className="min-h-11 rounded-xl bg-status-confirmed-bg px-4 font-bold text-status-confirmed">Valider</button></div></article>)}</section>}
    {tab === "appointments" && <section className="mt-6 overflow-x-auto rounded-2xl bg-white p-5 shadow-card"><table className="w-full text-left"><thead><tr className="border-b"><th className="p-3">Patient</th><th className="p-3">Cabinet</th><th className="p-3">Statut</th><th className="p-3">Créé le</th></tr></thead><tbody>{appointments.map((appointment) => <tr className="border-b border-brand-soft" key={appointment.id}><td className="p-3">{appointment.patient_id.slice(0, 8)}…</td><td className="p-3">{appointment.cabinets?.name ?? "—"}</td><td className="p-3"><StatusBadge status={appointment.status} /></td><td className="p-3">{new Date(appointment.created_at).toLocaleDateString("fr-FR")}</td></tr>)}</tbody></table></section>}
  </>}</main></div>;
}
