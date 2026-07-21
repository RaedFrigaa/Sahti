import { SiteHeader } from "@/components/site-header";
import { HistoryPanel } from "@/components/history-panel";

export default function Historique() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-3xl font-bold">Mon historique</h1>
        <p className="mt-2">Vos demandes de rendez-vous et leur statut.</p>
        <HistoryPanel />
      </main>
    </>
  );
}
