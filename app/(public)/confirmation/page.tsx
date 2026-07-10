import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { cabinets } from "@/lib/mock-data";
import { SiteHeader } from "@/components/site-header";
export default async function Confirmation({searchParams}:{searchParams:Promise<{cabinet?:string}>}) { const {cabinet}=await searchParams; const c=cabinets.find(x=>x.id===cabinet)??cabinets[0]; return <><SiteHeader/><main className="mx-auto max-w-xl px-4 py-20 text-center"><CheckCircle2 className="mx-auto h-16 w-16 text-status-confirmed"/><h1 className="mt-6 text-3xl font-bold">Votre RDV a bien été pris</h1><p className="mt-4 text-lg leading-8">L’assistance de <strong>{c.name}</strong> va vous contacter pour convenir d’un créneau.</p><div className="mt-10"><Link href="/" className="rounded-xl bg-brand-accent px-5 py-3 font-bold">Retour à l’accueil</Link></div></main></> }
