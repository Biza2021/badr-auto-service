import Link from "next/link";
import {
  CalendarCheck,
  Car,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  MessageCircle,
  PhoneCall,
  ShieldCheck,
  Wrench
} from "lucide-react";
import { ImagePanel } from "@/components/image-panel";
import { PublicShell } from "@/components/public-header";
import { SectionHeading } from "@/components/section-heading";

const services = [
  "Vidange et filtres",
  "Diagnostic moteur",
  "Freinage",
  "Batterie",
  "Pneus",
  "Climatisation"
];

const reasons = [
  "Devis clair avant les travaux importants",
  "Suivi par code pour connaître l’avancement",
  "Photos et notes organisées quand c’est utile",
  "Conseils simples adaptés à l’usage au Maroc"
];

const workflow = [
  "Réception du véhicule",
  "Diagnostic et premier retour",
  "Accord client avant intervention",
  "Réparation et contrôle qualité",
  "Récupération avec explications"
];

export default function HomePage() {
  return (
    <PublicShell>
      <main>
        <section className="relative min-h-[82vh] overflow-hidden bg-navy text-white">
          <ImagePanel
            src="/images/customer/01-homepage-hero-badr-auto-service.png"
            alt="Atelier Badr Auto Service"
            priority
            className="absolute inset-0 rounded-none opacity-55"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/82 to-navy/30" />
          <div className="container-page relative flex min-h-[82vh] items-center py-20">
            <div className="max-w-3xl">
              <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm font-semibold text-orange-100 ring-1 ring-white/15">
                <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                Garage automobile fiable à Casablanca
              </p>
              <h1 className="text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">
                Badr Auto Service
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-100">
                Entretien, diagnostic et réparation mécanique avec une organisation claire, un accueil
                humain et un suivi transparent pour chaque véhicule.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link className="btn-primary" href="/prendre-rendez-vous">
                  <CalendarCheck className="h-4 w-4" aria-hidden="true" />
                  Prendre rendez-vous
                </Link>
                <Link className="btn-secondary border-white/20 bg-white/10 text-white hover:bg-white/20" href="/suivi">
                  <ClipboardCheck className="h-4 w-4" aria-hidden="true" />
                  Suivre ma réparation
                </Link>
                <Link className="btn-secondary border-white/20 bg-white text-navy hover:bg-slate-100" href="/contact">
                  <PhoneCall className="h-4 w-4" aria-hidden="true" />
                  Contacter le garage
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white py-16">
          <div className="container-page grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <ImagePanel
              src="/images/customer/02-services-overview-badr-auto-service.png"
              alt="Services mécaniques Badr Auto Service"
              className="min-h-[320px]"
            />
            <div>
              <SectionHeading
                eyebrow="Services"
                title="Les interventions utiles, sans discours compliqué"
                text="Le garage couvre les besoins courants des automobilistes au Maroc, de l’entretien préventif au diagnostic quand un voyant ou un bruit apparaît."
              />
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {services.map((service) => (
                  <div className="flex items-center gap-3 rounded-lg bg-mist px-4 py-3" key={service}>
                    <CheckCircle2 className="h-5 w-5 text-accent" aria-hidden="true" />
                    <span className="text-sm font-semibold text-slate-800">{service}</span>
                  </div>
                ))}
              </div>
              <Link className="btn-dark mt-8" href="/services">
                Voir tous les services
              </Link>
            </div>
          </div>
        </section>

        <section className="bg-mist py-16">
          <div className="container-page grid gap-10 lg:grid-cols-[1fr_0.95fr] lg:items-center">
            <div>
              <SectionHeading
                eyebrow="Confiance"
                title="Pourquoi choisir Badr Auto Service ?"
                text="L’objectif est simple : faire le nécessaire correctement, expliquer ce qui est constaté et garder le client informé sans promesses exagérées."
              />
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {reasons.map((reason) => (
                  <div className="surface p-5" key={reason}>
                    <ShieldCheck className="h-6 w-6 text-accent" aria-hidden="true" />
                    <p className="mt-3 text-sm font-semibold leading-6 text-slate-800">{reason}</p>
                  </div>
                ))}
              </div>
            </div>
            <ImagePanel
              src="/images/customer/03-about-trust-badr-auto-service.png"
              alt="Équipe de confiance Badr Auto Service"
              className="min-h-[360px]"
            />
          </div>
        </section>

        <section className="bg-white py-16">
          <div className="container-page grid gap-8 lg:grid-cols-2">
            <div className="surface overflow-hidden">
              <ImagePanel
                src="/images/customer/04-online-appointment-booking-badr-auto-service.png"
                alt="Prise de rendez-vous en ligne"
                className="min-h-[260px] rounded-none"
              />
              <div className="p-6">
                <CalendarCheck className="h-7 w-7 text-accent" aria-hidden="true" />
                <h2 className="mt-3 text-2xl font-bold text-navy">Planifier un passage au garage</h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Envoyez les informations du véhicule, le service souhaité et le créneau préféré. L’équipe
                  confirme ensuite selon la disponibilité de l’atelier.
                </p>
                <Link className="btn-primary mt-5" href="/prendre-rendez-vous">
                  Prendre rendez-vous
                </Link>
              </div>
            </div>
            <div className="surface overflow-hidden">
              <ImagePanel
                src="/images/admin/06-customer-repair-tracking-ui-badr-auto-service.png"
                alt="Interface de suivi réparation client"
                className="min-h-[260px] rounded-none"
              />
              <div className="p-6">
                <ClipboardCheck className="h-7 w-7 text-accent" aria-hidden="true" />
                <h2 className="mt-3 text-2xl font-bold text-navy">Suivre l’avancement avec un code</h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Le suivi public affiche seulement les informations liées au code valide remis au client :
                  statut, étapes et date estimée de récupération.
                </p>
                <Link className="btn-dark mt-5" href="/suivi">
                  Suivre ma réparation
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-mist py-16">
          <div className="container-page grid gap-10 lg:grid-cols-3">
            <div className="lg:col-span-1">
              <SectionHeading
                eyebrow="Transparence"
                title="Documentation honnête des réparations"
                text="Pas de fausses promesses avant/après : les photos, les notes et les étapes servent à expliquer les constats, les choix et l’état du dossier."
              />
            </div>
            <div className="grid gap-6 lg:col-span-2 sm:grid-cols-2">
              <div className="surface overflow-hidden">
                <ImagePanel
                  src="/images/customer/11-repair-documentation-badr-auto-service.png"
                  alt="Documentation claire de réparation"
                  className="min-h-[240px] rounded-none"
                />
                <div className="p-5">
                  <FileText className="h-6 w-6 text-accent" aria-hidden="true" />
                  <p className="mt-3 font-semibold text-navy">Photos et notes utiles</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Les observations importantes sont gardées au même endroit pour éviter les malentendus.
                  </p>
                </div>
              </div>
              <div className="surface overflow-hidden">
                <ImagePanel
                  src="/images/customer/12-customer-communication-badr-auto-service.png"
                  alt="Communication WhatsApp avec le client"
                  className="min-h-[240px] rounded-none"
                />
                <div className="p-5">
                  <MessageCircle className="h-6 w-6 text-accent" aria-hidden="true" />
                  <p className="mt-3 font-semibold text-navy">Mises à jour WhatsApp</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Le client reçoit les informations essentielles au bon moment, surtout pour les accords.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white py-16">
          <div className="container-page grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <ImagePanel
              src="/images/customer/15-garage-workflow-operations-badr-auto-service.png"
              alt="Organisation de l’atelier Badr Auto Service"
              className="min-h-[380px]"
            />
            <div>
              <SectionHeading
                eyebrow="Méthode"
                title="Un flux de travail simple à comprendre"
                text="Chaque dossier suit une progression lisible, depuis l’arrivée du véhicule jusqu’au contrôle final."
              />
              <ol className="mt-8 space-y-4">
                {workflow.map((item, index) => (
                  <li className="flex gap-4" key={item}>
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-navy text-sm font-bold text-white">
                      {index + 1}
                    </span>
                    <span className="pt-1 text-sm font-semibold text-slate-800">{item}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        <section className="bg-mist py-16">
          <div className="container-page grid gap-10 lg:grid-cols-[1fr_0.9fr] lg:items-center">
            <div>
              <SectionHeading
                eyebrow="Technicien"
                title="Un espace mobile pour mieux suivre l’atelier"
                text="Les techniciens consultent les réparations assignées, les véhicules, les notes et les actions de statut depuis une interface adaptée au téléphone."
              />
              <div className="mt-6 flex flex-wrap gap-3">
                <span className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-slate-700 ring-1 ring-slate-200">
                  Checklist
                </span>
                <span className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-slate-700 ring-1 ring-slate-200">
                  Notes internes
                </span>
                <span className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-slate-700 ring-1 ring-slate-200">
                  Statuts rapides
                </span>
              </div>
            </div>
            <ImagePanel
              src="/images/admin/10-technician-mobile-dashboard-badr-auto-service.png"
              alt="Interface mobile technicien"
              className="min-h-[360px]"
            />
          </div>
        </section>

        <section className="bg-white py-16">
          <div className="container-page grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <ImagePanel
              src="/images/customer/05-contact-location-badr-auto-service.png"
              alt="Contact et localisation Badr Auto Service"
              className="min-h-[330px]"
            />
            <div>
              <SectionHeading
                eyebrow="Contact"
                title="Besoin d’un avis avant de passer ?"
                text="Appelez le garage ou envoyez un message WhatsApp avec les symptômes, le modèle du véhicule et les disponibilités."
              />
              <div className="mt-6 grid gap-3 text-sm font-semibold text-slate-800">
                <p className="flex items-center gap-3">
                  <PhoneCall className="h-5 w-5 text-accent" aria-hidden="true" />
                  +212 5 22 48 19 70
                </p>
                <p className="flex items-center gap-3">
                  <MessageCircle className="h-5 w-5 text-accent" aria-hidden="true" />
                  WhatsApp : +212 6 61 24 87 30
                </p>
                <p className="flex items-center gap-3">
                  <Car className="h-5 w-5 text-accent" aria-hidden="true" />
                  Lundi - samedi, 08:30 - 18:30
                </p>
              </div>
              <Link className="btn-dark mt-7" href="/contact">
                Voir les coordonnées
              </Link>
            </div>
          </div>
        </section>
      </main>
    </PublicShell>
  );
}
