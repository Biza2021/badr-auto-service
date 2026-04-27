import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap"
});

export const metadata: Metadata = {
  title: {
    default: "Badr Auto Service",
    template: "%s | Badr Auto Service"
  },
  description:
    "Garage automobile marocain pour entretien, diagnostic, réparations et suivi client transparent.",
  metadataBase: new URL("https://badrautoservice.ma")
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
