import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
 title: "Brottberga församling – Ett liv med Jesus, tillsammans i Västerås",
 description: "En växande församling i Västerås med Jesus i centrum. Lovsång, healing och bibelstudier på Brottberga Gård 1. Söndagar 11.00 och torsdagar 18.30.",
 icons: {icon: "/favicon.svg", shortcut: "/favicon.svg"},
};
export default function RootLayout({children}: Readonly<{children: React.ReactNode}>) { return <html lang="sv"><body>{children}</body></html>; }
