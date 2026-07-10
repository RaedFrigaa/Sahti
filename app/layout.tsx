import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "Sahti | Ma santé", description: "Trouvez un professionnel de santé près de chez vous." };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="fr"><body>{children}</body></html>; }
