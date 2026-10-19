import { Suspense } from "react";
import { Geist, Playfair_Display } from "next/font/google";
import Sidebar from "@/components/Sidebar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "latin-ext"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin", "latin-ext"],
  style: ["normal", "italic"],
});

export const metadata = {
  title: "Könyvespolc",
  description: "Olvasásaim nyomon követése",
};

export default function RootLayout({ children }) {
  return (
    <html lang="hu" className={`${geistSans.variable} ${playfair.variable} h-full antialiased`}>
      <body className="min-h-full font-sans md:flex">
        <Suspense>
          <Sidebar />
        </Suspense>
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 pt-6 pb-28 sm:px-8 md:pt-10 md:pb-12">{children}</main>
      </body>
    </html>
  );
}
