import { SiteHeader } from "@/components/site-header";
import { StatusBadge } from "@/components/ui";
import { appointments } from "@/lib/mock-data";
export default function Historique() { return <><SiteHeader/><main className="mx-auto max-w-3xl px-4 py-10"><h1 className="text-3xl font-bold">Mon historique</h1><p className="mt-2">Vos demandes de rendez-vous et leur statut.</p><div className="mt-7 space-y-4">{appointments.filter(a=>a.status==="confirmed").map(a=><article key={a.id} className="flex flex-col justify-between gap-3 rounded-2xl bg-white p-5 shadow-card sm:flex-row sm:items-center"><div><h2 className="text-xl font-bold">{a.cabinet}</h2><p className="mt-1">Patient : {a.patient}</p></div><StatusBadge status={a.status}/></article>)}</div></main></> }
