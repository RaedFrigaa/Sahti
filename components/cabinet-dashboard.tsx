"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { Flag, Loader2, LogOut, Pencil, Upload, X } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { Logo, StatusBadge } from "@/components/ui";

type Appointment = { id: string; patient_id: string; status: "pending" | "confirmed" | "declined"; created_at: string };
type Review = { id: string; rating: number; comment: string; reported: boolean };
type Cabinet = { id: string; name: string; specialty: string; wilaya: string; address: string; phone: string; consultation_price: number; description: string | null; image_url: string | null; gallery_urls: string[] | null };
type CabinetForm = Pick<Cabinet, "name" | "specialty" | "wilaya" | "address" | "phone" | "description"> & { consultation_price: string };

const emptyForm: CabinetForm = { name: "", specialty: "", wilaya: "", address: "", phone: "", consultation_price: "", description: "" };

export function CabinetDashboard() {
  const [cabinet, setCabinet] = useState<Cabinet | null>(null);
  const [form, setForm] = useState<CabinetForm>(emptyForm);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [message, setMessage] = useState("");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  function setFormFromCabinet(item: Cabinet) {
    setForm({ name: item.name, specialty: item.specialty, wilaya: item.wilaya, address: item.address, phone: item.phone, consultation_price: String(item.consultation_price), description: item.description ?? "" });
  }

  async function load() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: item, error } = await supabase.from("cabinets").select("id, name, specialty, wilaya, address, phone, consultation_price, description, image_url, gallery_urls").eq("owner_id", user.id).single();
    if (error || !item) { setMessage("Aucun cabinet n’est associé à ce compte."); return; }
    const currentCabinet = item as Cabinet;
    setCabinet(currentCabinet); setFormFromCabinet(currentCabinet);
    const [appointmentResult, reviewResult] = await Promise.all([
      supabase.from("appointments").select("id, patient_id, status, created_at").eq("cabinet_id", currentCabinet.id).order("created_at", { ascending: false }),
      supabase.from("reviews").select("id, rating, comment, reported").eq("cabinet_id", currentCabinet.id).order("created_at", { ascending: false }),
    ]);
    if (appointmentResult.error || reviewResult.error) setMessage((appointmentResult.error || reviewResult.error)?.message ?? "Erreur de chargement.");
    else { setAppointments((appointmentResult.data ?? []) as Appointment[]); setReviews((reviewResult.data ?? []) as Review[]); }
  }

  useEffect(() => { void load(); }, []);

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!cabinet) return;
    setSaving(true); setMessage("");
    const { error } = await createClient().from("cabinets").update({ ...form, consultation_price: Number(form.consultation_price) }).eq("id", cabinet.id);
    setSaving(false);
    if (error) { setMessage(error.message); return; }
    setMessage("Informations du cabinet enregistrées."); setEditing(false); void load();
  }

  async function uploadPhotos(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (!cabinet || files.length === 0) return;
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setUploading(true); setMessage("");
    const urls: string[] = [];
    for (const file of files) {
      if (!file.type.startsWith("image/")) { setMessage("Seuls les fichiers image sont acceptés."); continue; }
      if (file.size > 5 * 1024 * 1024) { setMessage("Chaque image doit faire au maximum 5 Mo."); continue; }
      const extension = file.name.split(".").pop() || "jpg";
      const path = `${user.id}/${crypto.randomUUID()}.${extension}`;
      const { error } = await supabase.storage.from("cabinet-images").upload(path, file, { contentType: file.type });
      if (error) { setMessage(error.message); continue; }
      urls.push(supabase.storage.from("cabinet-images").getPublicUrl(path).data.publicUrl);
    }
    if (urls.length > 0) {
      const gallery = [...(cabinet.gallery_urls ?? []), ...urls];
      const { error } = await supabase.from("cabinets").update({ gallery_urls: gallery, image_url: cabinet.image_url ?? gallery[0] }).eq("id", cabinet.id);
      setMessage(error ? error.message : "Photo(s) ajoutée(s).");
      if (!error) void load();
    }
    setUploading(false); event.target.value = "";
  }

  async function removePhoto(url: string) {
    if (!cabinet) return;
    const gallery = (cabinet.gallery_urls ?? []).filter((photo) => photo !== url);
    const { error } = await createClient().from("cabinets").update({ gallery_urls: gallery, image_url: gallery[0] ?? null }).eq("id", cabinet.id);
    setMessage(error ? error.message : "Photo supprimée.");
    if (!error) void load();
  }

  async function updateAppointment(id: string, status: "confirmed" | "declined") { const { error } = await createClient().from("appointments").update({ status }).eq("id", id); setMessage(error ? error.message : "Rendez-vous mis à jour."); if (!error) void load(); }
  async function reportReview(id: string) { const { error } = await createClient().from("reviews").update({ reported: true }).eq("id", id); setMessage(error ? error.message : "Avis signalé à l’administration."); if (!error) void load(); }
  async function signOut() { await createClient().auth.signOut(); window.location.assign("/login"); }

  return <main className="min-h-screen bg-brand-soft"><header className="bg-white"><div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4"><Logo /><button onClick={() => void signOut()} className="inline-flex min-h-11 items-center gap-2 font-bold"><LogOut className="h-4 w-4" />Déconnexion</button></div></header><div className="mx-auto max-w-6xl px-4 py-10"><div className="flex flex-wrap items-end justify-between gap-3"><div><p className="font-bold text-brand-secondary">{cabinet?.name || "Chargement…"}</p><h1 className="mt-1 text-3xl font-bold">Tableau de bord</h1></div><button onClick={() => { if (cabinet) { setFormFromCabinet(cabinet); setEditing((value) => !value); } }} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-brand-ink px-4 font-bold text-white"><Pencil className="h-4 w-4" />Modifier mon cabinet</button></div>{message && <p role="status" className="mt-4 rounded-xl bg-white p-3 font-semibold">{message}</p>}
    {editing && cabinet && <section className="mt-8 rounded-2xl bg-white p-5 shadow-card"><h2 className="text-2xl font-bold">Informations du cabinet</h2><form onSubmit={saveProfile} className="mt-5 grid gap-4 sm:grid-cols-2"><Field label="Nom" value={form.name} onChange={(value) => setForm({ ...form, name: value })} /><Field label="Spécialité" value={form.specialty} onChange={(value) => setForm({ ...form, specialty: value })} /><Field label="Wilaya / localisation" value={form.wilaya} onChange={(value) => setForm({ ...form, wilaya: value })} /><Field label="Adresse" value={form.address} onChange={(value) => setForm({ ...form, address: value })} /><Field label="Téléphone" value={form.phone} onChange={(value) => setForm({ ...form, phone: value })} /><Field label="Prix de la consultation (DA)" type="number" value={form.consultation_price} onChange={(value) => setForm({ ...form, consultation_price: value })} /><label className="sm:col-span-2"><span className="text-sm font-bold">Description</span><textarea value={form.description ?? ""} onChange={(event) => setForm({ ...form, description: event.target.value })} className="mt-1 min-h-28 w-full rounded-lg border p-3" /></label><div className="sm:col-span-2"><button disabled={saving} className="min-h-11 rounded-xl bg-brand-accent px-5 font-bold disabled:opacity-60">{saving ? "Enregistrement…" : "Enregistrer les modifications"}</button></div></form><div className="mt-8 border-t pt-5"><h3 className="text-xl font-bold">Photos du cabinet</h3><p className="mt-1 text-sm">Formats image, 5 Mo maximum par fichier.</p><label className="mt-4 inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl bg-brand-ink px-4 py-3 font-bold text-white"><Upload className="h-4 w-4" />{uploading ? "Envoi en cours…" : "Ajouter des photos"}<input type="file" accept="image/*" multiple onChange={uploadPhotos} disabled={uploading} className="hidden" /></label><div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">{(cabinet.gallery_urls ?? (cabinet.image_url ? [cabinet.image_url] : [])).map((url) => <figure key={url} className="relative aspect-square overflow-hidden rounded-xl bg-brand-soft"><img src={url} alt="Photo du cabinet" className="h-full w-full object-cover" /><button type="button" onClick={() => void removePhoto(url)} aria-label="Supprimer cette photo" className="absolute right-2 top-2 rounded-full bg-white p-2 text-status-declined shadow"><X className="h-4 w-4" /></button></figure>)}</div></div></section>}
    <section className="mt-8 rounded-2xl bg-white p-5 shadow-card"><h2 className="text-2xl font-bold">Demandes de rendez-vous</h2><div className="mt-4 overflow-x-auto"><table className="w-full text-left"><thead><tr className="border-b"><th className="p-3">Patient</th><th className="p-3">Date</th><th className="p-3">Statut</th><th className="p-3">Réponse</th></tr></thead><tbody>{appointments.map((appointment) => <tr key={appointment.id} className="border-b border-brand-soft"><td className="p-3 font-semibold">{appointment.patient_id.slice(0, 8)}…</td><td className="p-3">{new Date(appointment.created_at).toLocaleDateString("fr-FR")}</td><td className="p-3"><StatusBadge status={appointment.status} /></td><td className="p-3">{appointment.status === "pending" ? <div className="flex gap-2"><button onClick={() => void updateAppointment(appointment.id, "confirmed")} className="min-h-11 rounded-lg bg-status-confirmed-bg px-3 font-bold text-status-confirmed">Oui</button><button onClick={() => void updateAppointment(appointment.id, "declined")} className="min-h-11 rounded-lg bg-red-50 px-3 font-bold text-status-declined">Non</button></div> : "—"}</td></tr>)}</tbody></table></div></section><section className="mt-8 rounded-2xl bg-white p-5 shadow-card"><h2 className="text-2xl font-bold">Avis reçus</h2><div className="mt-4 space-y-3">{reviews.map((review) => <article key={review.id} className="flex flex-col justify-between gap-3 rounded-xl border border-brand-soft p-4 sm:flex-row"><div><strong>{review.rating}/5</strong><p className="mt-1">{review.comment}</p></div><button onClick={() => void reportReview(review.id)} disabled={review.reported} className="inline-flex min-h-11 items-center gap-2 rounded-lg px-3 font-bold text-brand-secondary hover:bg-brand-soft disabled:opacity-60"><Flag className="h-4 w-4" />{review.reported ? "Signalé" : "Signaler"}</button></article>)}</div></section></div></main>;
}

function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (value: string) => void; type?: string }) {
  return <label><span className="text-sm font-bold">{label}</span><input required value={value} type={type} onChange={(event) => onChange(event.target.value)} className="mt-1 min-h-11 w-full rounded-lg border px-3" /></label>;
}
