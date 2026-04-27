import type { Metadata } from "next";
import { Battery, CarFront, Fan, Gauge, SearchCheck, ShieldCheck, Snowflake, Wrench } from "lucide-react";
import { ImagePanel } from "@/components/image-panel";
import { PublicShell } from "@/components/public-header";
import { SectionHeading } from "@/components/section-heading";

export const metadata: Metadata = {
  title: "Services"
};

const services = [
  {
    title: "Vidange",
    text: "Huile moteur, filtres et contrôle visuel des points essentiels.",
    icon: Wrench
  },
  {
    title: "Diagnostic moteur",
    text: "Lecture valise, analyse des symptômes et conseils avant réparation.",
    icon: Gauge
  },
  {
    title: "Freinage",
    text: "Plaquettes, disques, liquide de frein et contrôle de sécurité.",
    icon: ShieldCheck
  },
  {
    title: "Batterie",
    text: "Test de charge, remplacement et contrôle du circuit de démarrage.",
    icon: Battery
  },
  {
    title: "Pneus",
    text: "Inspection, permutation, pression et orientation vers le bon montage.",
    icon: CarFront
  },
  {
    title: "Climatisation",
    text: "Diagnostic, recharge et recherche de fuite selon le cas.",
    icon: Snowflake
  },
  {
    title: "Suspension",
    text: "Contrôle amortisseurs, rotules, silentblocs et bruits de train roulant.",
    icon: Fan
  },
  {
    title: "Entretien général",
    text: "Suivi périodique adapté au kilométrage et aux trajets quotidiens.",
    icon: Wrench
  },
  {
    title: "Inspection avant achat",
    text: "Vérification mécanique pour acheter une voiture d’occasion avec plus de recul.",
    icon: SearchCheck
  }
];

export default function ServicesPage() {
  return (
    <PublicShell>
      <main className="bg-mist">
        <section className="bg-white py-12 sm:py-14">
          <div className="container-page grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <div>
              <SectionHeading
                eyebrow="Services"
                title="Entretien et réparation pour les besoins réels du quotidien"
                text="Badr Auto Service privilégie une approche claire : comprendre le problème, expliquer les options et intervenir avec méthode."
              />
            </div>
            <ImagePanel
              src="/images/customer/02-services-overview-badr-auto-service.png"
              alt="Aperçu des services Badr Auto Service"
              className="min-h-[260px] sm:min-h-[320px]"
              priority
            />
          </div>
        </section>
        <section className="py-12 sm:py-14">
          <div className="container-page grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => {
              const Icon = service.icon;
              return (
                <article className="surface p-6" key={service.title}>
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-orange-50 text-accent">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <h2 className="mt-5 text-xl font-bold text-navy">{service.title}</h2>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{service.text}</p>
                </article>
              );
            })}
          </div>
        </section>
      </main>
    </PublicShell>
  );
}
