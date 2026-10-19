import { Suspense } from "react";
import { Geist, Literata } from "next/font/google";
import Nav from "@/components/Nav";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "latin-ext"],
});

const literata = Literata({
  variable: "--font-serif",
  subsets: ["latin", "latin-ext"],
});

export const metadata = {
  title: "Könyvespolc",
  description: "Olvasásaim nyomon követése",
};

export default function RootLayout({ children }) {
  return (
    <html lang="hu" className={`${geistSans.variable} ${literata.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <Suspense>
          <Nav />
        </Suspense>
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
