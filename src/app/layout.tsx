import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProfileWidget from "@/components/ProfileWidget";
import { getSession } from "@/lib/auth";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mentora — Tutorías Universitarias Entre Pares",
  description:
    "Encuentra tutores verificados de tu misma universidad que ya pasaron el ramo que necesitas. Aprende de pares reales, con notas reales.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();

  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex flex-col min-h-screen bg-white text-slate-900">
        <Navbar session={session} />
        <main className="flex-1">{children}</main>
        <Footer />
        <ProfileWidget />
      </body>
    </html>
  );
}
