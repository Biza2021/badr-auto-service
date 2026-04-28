import Image from "next/image";
import Link from "next/link";
import {
  CalendarCheck,
  Car,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  MessageCircle,
  PhoneCall,
  ShieldCheck
} from "lucide-react";
import { ImagePanel } from "@/components/image-panel";
import { PublicShell } from "@/components/public-header";
import { SectionHeading } from "@/components/section-heading";
import { getGarageSettings } from "@/lib/garage-settings";

export const dynamic = "force-dynamic";

const services = [
  "Vidange et filtres",
  "Diagnostic moteur",
  "Freinage",
  "Batterie",
  "Pneus",
  "Climatisation"
];

const reasons = [
  "Un devis clair avant les travaux importants",
  "Un code de suivi pour consulter l’avancement",
  "Des photos et notes quand elles aident à comprendre",
  "Des conseils adaptés aux voitures utilisées au Maroc"
];

const workflow = [
  "Réception du véhicule",
  "Diagnostic et premier retour",
  "Accord client avant intervention",
  "Réparation et contrôle qualité",
  "Récupération avec explications"
];

export default async function HomePage() {
  const settings = await getGarageSettings();

  return (
    <PublicShell settings={settings}>
      <main>
        <section className="relative overflow-hidden bg-navy text-white">
          <div className="absolute inset-0">
            <Image
              src="/images/customer/01-homepage-hero-badr-auto-service.png"
              alt={`Atelier ${settings.garageName} avec véhicules en réparation`}
              fill
              priority
              sizes="100vw"
              className="object-cover object-center"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-navy/82 via-navy/62 to-navy/88 lg:bg-gradient-to-r lg:from-navy/92 lg:via-navy/64 lg:to-navy/18" />
          <div className="container-page relative flex min-h-[520px] items-end py-10 sm:min-h-[600px] sm:py-14 lg:min-h-[660px] lg:items-center lg:py-20">
            <div className="max-w-3xl">
              <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/12 px-3 py-1 text-xs font-semibold text-orange-100 ring-1 ring-white/20 sm:text-sm">
                <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                {settings.address}
              </p>
              <h1 className="text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">{settings.garageName}</h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-100 sm:text-lg sm:leading-8">
                Entretien, diagnostic et réparation automobile avec prise de rendez-vous en ligne,
                suivi par code et échanges clairs avec le garage.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link className="btn-primary w-full sm:w-auto" href="/prendre-rendez-vous">
                  <CalendarCheck className="h-4 w-4" aria-hidden="true" />
                  Prendre rendez-vous
                </Link>
                <Link
                  className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-white/25 bg-white/12 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-white/20 focus:outline-none focus:ring-4 focus:ring-white/20 sm:w-auto"
                  href="/suivi"
                >
                  <ClipboardCheck className="h-4 w-4" aria-hidden="true" />
                  Suivre ma réparation
                </Link>
                <Link
                  className="btn-secondary w-full border-white/20 bg-white text-navy hover:bg-slate-100 sm:w-auto"
                  href="/contact"
                >
                  <PhoneCall className="h-4 w-4" aria-hidden="true" />
                  Contacter le garage
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white py-12 sm:py-16">
          <div className="container-page grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <ImagePanel
              src="/images/customer/02-services-overview-badr-auto-service.png"
              alt={`Services mécaniques proposés par ${settings.garageName}`}
              className="min-h-[260px] sm:min-h-[320px]"
            />
            <div>
              <SectionHeading
                eyebrow="Services"
                title="Les interventions essentielles, expliquées simplement"
                text="Le garage accompagne les conducteurs pour l’entretien courant, les voyants moteur, les bruits suspects et les contrôles avant achat."
              />
              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                {services.map((service) => (
                  <div className="flex items-center gap-3 rounded-lg bg-mist px-4 py-3" key={service}>
                    <CheckCircle2 className="h-5 w-5 text-accent" aria-hidden="true" />
                    <span className="text-sm font-semibold text-slate-800">{service}</span>
                  </div>
                ))}
              </div>
              <Link className="btn-dark mt-7 w-full sm:w-auto" href="/services">
                Voir tous les services
              </Link>
            </div>
          </div>
        </section>

        <section className="bg-mist py-12 sm:py-16">
          <div className="container-page grid gap-8 lg:grid-cols-[1fr_0.95fr] lg:items-center">
            <div>
              <SectionHeading
                eyebrow="Confiance"
                title="Une relation claire entre le client et l’atelier"
                text={`${settings.garageName} privilégie les explications utiles, les accords avant intervention et un suivi organisé, sans promesses exagérées.`}
              />
              <div className="mt-7 grid gap-4 sm:grid-cols-2">
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
              alt={`Accueil professionnel au garage ${settings.garageName}`}
              className="min-h-[280px] sm:min-h-[360px]"
            />
          </div>
        </section>

        <section className="bg-white py-12 sm:py-16">
          <div className="container-page grid gap-6 lg:grid-cols-2">
            <div className="surface overflow-hidden">
              <ImagePanel
                src="/images/customer/04-online-appointment-booking-badr-auto-service.png"
                alt="Demande de rendez-vous en ligne pour un véhicule"
                className="min-h-[220px] rounded-none sm:min-h-[260px]"
              />
              <div className="p-5 sm:p-6">
                <CalendarCheck className="h-7 w-7 text-accent" aria-hidden="true" />
                <h2 className="mt-3 text-2xl font-bold text-navy">Demander un rendez-vous</h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Le client indique le véhicule, le service souhaité, le problème observé et le créneau
                  préféré. Le garage confirme ensuite selon la disponibilité de l’atelier.
                </p>
                <Link className="btn-primary mt-5 w-full sm:w-auto" href="/prendre-rendez-vous">
                  Prendre rendez-vous
                </Link>
              </div>
            </div>
            <div className="surface overflow-hidden">
              <ImagePanel
                src="/images/admin/06-customer-repair-tracking-ui-badr-auto-service.png"
                alt="Écran de suivi client avec code de réparation"
                className="min-h-[220px] rounded-none sm:min-h-[260px]"
              />
              <div className="p-5 sm:p-6">
                <ClipboardCheck className="h-7 w-7 text-accent" aria-hidden="true" />
                <h2 className="mt-3 text-2xl font-bold text-navy">Suivre la réparation avec un code</h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Le suivi public affiche uniquement les informations liées au code remis au client :
                  statut, étapes du dossier et date estimée de récupération.
                </p>
                <Link className="btn-dark mt-5 w-full sm:w-auto" href="/suivi">
                  Suivre ma réparation
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-mist py-12 sm:py-16">
          <div className="container-page grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-1">
              <SectionHeading
                eyebrow="Transparence"
                title="Des réparations documentées avec honnêteté"
                text="Les photos, les notes et les étapes servent à expliquer les constats et les choix proposés. La transparence ne repose pas sur de fausses comparaisons avant/après."
              />
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:col-span-2">
              <div className="surface overflow-hidden">
                <ImagePanel
                  src="/images/customer/11-repair-documentation-badr-auto-service.png"
                  alt="Documentation claire d’une réparation automobile"
                  className="min-h-[220px] rounded-none sm:min-h-[240px]"
                />
                <div className="p-5">
                  <FileText className="h-6 w-6 text-accent" aria-hidden="true" />
                  <p className="mt-3 font-semibold text-navy">Photos et notes utiles</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Les observations importantes restent liées au dossier pour éviter les oublis et les malentendus.
                  </p>
                </div>
              </div>
              <div className="surface overflow-hidden">
                <ImagePanel
                  src="/images/customer/12-customer-communication-badr-auto-service.png"
                  alt="Communication WhatsApp entre le garage et le client"
                  className="min-h-[220px] rounded-none sm:min-h-[240px]"
                />
                <div className="p-5">
                  <MessageCircle className="h-6 w-6 text-accent" aria-hidden="true" />
                  <p className="mt-3 font-semibold text-navy">Mises à jour claires</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Le client reçoit les informations importantes au bon moment, notamment lorsqu’un accord est nécessaire.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white py-12 sm:py-16">
          <div className="container-page grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <ImagePanel
              src="/images/customer/15-garage-workflow-operations-badr-auto-service.png"
              alt={`Organisation de l’atelier ${settings.garageName}`}
              className="min-h-[280px] sm:min-h-[380px]"
            />
            <div>
              <SectionHeading
                eyebrow="Méthode"
                title="Un parcours simple du dépôt à la récupération"
                text="Chaque dossier suit des étapes lisibles pour l’équipe et pour le client, depuis la réception du véhicule jusqu’au contrôle final."
              />
              <ol className="mt-7 space-y-4">
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

        <section className="bg-mist py-12 sm:py-16">
          <div className="container-page grid gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-center">
            <div>
              <SectionHeading
                eyebrow="Gestion atelier"
                title="Un back-office pratique pour le responsable et les techniciens"
                text="Badr peut gérer les réparations, clients, rendez-vous, factures, paiements et techniciens depuis l’espace admin. Les techniciens disposent aussi d’une vue mobile pensée pour l’atelier."
              />
              <div className="mt-6 flex flex-wrap gap-3">
                <span className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-slate-700 ring-1 ring-slate-200">
                  Liste de contrôle
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
              alt="Espace mobile utilisé par les techniciens"
              className="min-h-[300px] sm:min-h-[360px]"
            />
          </div>
        </section>

        <section className="bg-white py-12 sm:py-16">
          <div className="container-page grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <ImagePanel
              src="/images/customer/05-contact-location-badr-auto-service.png"
              alt={`Contact et localisation de ${settings.garageName}`}
              className="min-h-[260px] sm:min-h-[330px]"
            />
            <div>
              <SectionHeading
                eyebrow="Contact"
                title="Besoin d’un avis avant de passer ?"
                text="Appelez le garage ou envoyez un message WhatsApp avec les symptômes, le modèle du véhicule et vos disponibilités."
              />
              <div className="mt-6 grid gap-3 text-sm font-semibold text-slate-800">
                <p className="flex items-center gap-3">
                  <PhoneCall className="h-5 w-5 text-accent" aria-hidden="true" />
                  {settings.phoneNumber}
                </p>
                <p className="flex items-center gap-3">
                  <MessageCircle className="h-5 w-5 text-accent" aria-hidden="true" />
                  WhatsApp : {settings.whatsappNumber}
                </p>
                <p className="flex items-center gap-3">
                  <Car className="h-5 w-5 text-accent" aria-hidden="true" />
                  {settings.openingHours}
                </p>
                <p className="flex items-center gap-3">
                  <ShieldCheck className="h-5 w-5 text-accent" aria-hidden="true" />
                  {settings.address}
                </p>
              </div>
              <Link className="btn-dark mt-7 w-full sm:w-auto" href="/contact">
                Voir les coordonnées
              </Link>
            </div>
          </div>
        </section>
      </main>
    </PublicShell>
  );
}
