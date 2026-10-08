import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
 title: "Brottberga församling – Ett liv med Jesus, tillsammans i Västerås",
 description: "En lokal kristen gemenskap på Brottberga Gård 1 i Västerås. Välkommen på söndagar kl. 11.00 och torsdagar kl. 18.30. Jesus i centrum, plats för dig.",
 icons: {icon: "/favicon.svg", shortcut: "/favicon.svg"},
};
export default function RootLayout({children}: Readonly<{children: React.ReactNode}>) { return <html lang="sv"><body>{children}</body></html>; }
