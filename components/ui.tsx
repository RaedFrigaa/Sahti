import Link from "next/link";
import { Star } from "lucide-react";
import type { Status } from "@/lib/mock-data";
export function Logo() { return <Link href="/" className="text-2xl font-bold tracking-tight text-brand-ink">sahti<span className="text-brand-accent">.</span></Link>; }
export function StatusBadge({ status }: { status: Status }) { const text = status === "confirmed" ? "Confirmé" : status === "declined" ? "Refusé" : "En attente"; const colors = status === "confirmed" ? "bg-status-confirmed-bg text-status-confirmed" : status === "declined" ? "bg-red-50 text-status-declined" : "bg-white text-brand-ink border-brand-muted"; return <span className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-semibold ${colors}`}>{text}</span>; }
export function Stars({ rating }: { rating: number }) { return <span className="inline-flex items-center gap-1 text-sm font-semibold text-brand-ink"><Star className="h-4 w-4 fill-brand-accent text-brand-accent" aria-hidden="true" />{rating.toFixed(1)}</span>; }
export function PrimaryButton({ children, className = "", ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) { return <button className={`min-h-11 rounded-xl bg-brand-accent px-5 py-3 font-bold text-brand-ink transition hover:bg-brand-muted disabled:cursor-not-allowed disabled:opacity-50 ${className}`} {...props}>{children}</button>; }
