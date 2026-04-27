import type { Metadata } from "next";
import Link from "next/link";
import { CalendarCheck, MapPin, MessageCircle, PhoneCall } from "lucide-react";
import { ImagePanel } from "@/components/image-panel";
import { PublicShell } from "@/components/public-header";
import { SectionHeading } from "@/components/section-heading";

export const metadata: Metadata = {
  title: "Contact"
};

export default function ContactPage() {
  return (
    <PublicShell>
      <main className="bg-mist">
        <section className="bg-white py-12 sm:py-14">
          <div className="container-page grid gap-8 lg:grid-cols-[1fr_0.95fr] lg:items-center">
            <div>
              <SectionHeading
                eyebrow="Contact"
                title="Contacter Badr Auto Service"
                text="Pour un rendez-vous, un suivi ou une question sur un bruit, un voyant ou une intervention, l’équipe répond pendant les horaires d’ouverture."
              />
              <div className="mt-8 grid gap-4">
                <div className="surface p-5">
                  <p className="flex items-center gap-3 font-semibold text-navy">
                    <PhoneCall className="h-5 w-5 text-accent" aria-hidden="true" />
                    Téléphone
                  </p>
                  <p className="mt-2 text-sm text-slate-600">+212 5 22 48 19 70</p>
                </div>
                <div className="surface p-5">
                  <p className="flex items-center gap-3 font-semibold text-navy">
                    <MessageCircle className="h-5 w-5 text-accent" aria-hidden="true" />
                    WhatsApp
                  </p>
                  <p className="mt-2 text-sm text-slate-600">+212 6 61 24 87 30</p>
                </div>
                <div className="surface p-5">
                  <p className="flex items-center gap-3 font-semibold text-navy">
                    <MapPin className="h-5 w-5 text-accent" aria-hidden="true" />
                    Adresse
                  </p>
                  <p className="mt-2 text-sm text-slate-600">
                    Angle rue Al Massira et rue Ibn Tachfine, Casablanca
                  </p>
                </div>
              </div>
              <Link className="btn-primary mt-7 w-full sm:w-auto" href="/prendre-rendez-vous">
                <CalendarCheck className="h-4 w-4" aria-hidden="true" />
                Prendre rendez-vous
              </Link>
            </div>
            <ImagePanel
              src="/images/customer/05-contact-location-badr-auto-service.png"
              alt="Localisation du garage Badr Auto Service"
              className="min-h-[280px] sm:min-h-[420px]"
              priority
            />
          </div>
        </section>
      </main>
    </PublicShell>
  );
}
