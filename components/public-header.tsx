import Link from "next/link";
import { CalendarCheck, MapPin, Menu, PhoneCall, Wrench } from "lucide-react";
import { getGarageSettings, type GarageSettingsView } from "@/lib/garage-settings";

const navItems = [
  { href: "/services", label: "Services" },
  { href: "/prendre-rendez-vous", label: "Rendez-vous" },
  { href: "/suivi", label: "Suivi réparation" },
  { href: "/contact", label: "Contact" }
];

export function PublicHeader({ settings }: { settings: GarageSettingsView }) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="container-page flex min-h-16 items-center justify-between gap-3 py-3">
        <Link href="/" className="flex items-center gap-3" aria-label={`Accueil ${settings.garageName}`}>
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy text-white">
            <Wrench className="h-5 w-5" aria-hidden="true" />
          </span>
          <span>
            <span className="block text-base font-bold text-navy">{settings.garageName}</span>
            <span className="block max-w-48 truncate text-xs font-medium text-slate-500 sm:max-w-none">
              {settings.address}
            </span>
          </span>
        </Link>
        <nav className="hidden flex-wrap items-center gap-2 text-sm font-semibold text-slate-700 md:flex">
          {navItems.map((item) => (
            <Link
              className="rounded-lg px-3 py-2 transition hover:bg-slate-100 hover:text-navy"
              href={item.href}
              key={item.href}
            >
              {item.label}
            </Link>
          ))}
          <Link className="btn-primary py-2" href="/prendre-rendez-vous">
            <CalendarCheck className="h-4 w-4" aria-hidden="true" />
            Prendre rendez-vous
          </Link>
        </nav>
        <details className="relative md:hidden">
          <summary className="btn-secondary list-none px-3 py-2" aria-label="Ouvrir le menu">
            <Menu className="h-4 w-4" aria-hidden="true" />
          </summary>
          <nav className="absolute right-0 mt-3 grid w-64 gap-2 rounded-lg border border-slate-200 bg-white p-3 text-sm font-semibold text-slate-800 shadow-soft">
            {navItems.map((item) => (
              <Link className="rounded-lg bg-slate-50 px-3 py-3" href={item.href} key={item.href}>
                {item.label}
              </Link>
            ))}
            <Link className="btn-primary w-full" href="/prendre-rendez-vous">
              <CalendarCheck className="h-4 w-4" aria-hidden="true" />
              Prendre rendez-vous
            </Link>
          </nav>
        </details>
      </div>
    </header>
  );
}

export function PublicFooter({ settings }: { settings: GarageSettingsView }) {
  return (
    <footer className="bg-navy text-white">
      <div className="container-page grid gap-8 py-10 md:grid-cols-[1.2fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-white">
              <Wrench className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="text-lg font-bold">{settings.garageName}</span>
          </div>
          <p className="mt-4 max-w-md text-sm leading-6 text-slate-300">
            Entretien, diagnostic et réparation automobile avec un suivi clair et des conseils honnêtes.
          </p>
        </div>
        <div>
          <p className="font-semibold">Coordonnées</p>
          <div className="mt-4 space-y-3 text-sm text-slate-300">
            <p className="flex items-center gap-2">
              <PhoneCall className="h-4 w-4 text-accent" aria-hidden="true" />
              {settings.phoneNumber}
            </p>
            <p className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 text-accent" aria-hidden="true" />
              {settings.address}
            </p>
          </div>
        </div>
        <div>
          <p className="font-semibold">Accès rapide</p>
          <div className="mt-4 grid gap-2 text-sm text-slate-300">
            {navItems.map((item) => (
              <Link className="hover:text-white" href={item.href} key={item.href}>
                {item.label}
              </Link>
            ))}
            <Link className="hover:text-white" href="/admin/login">
              Espace équipe
            </Link>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} {settings.garageName}. Tous droits réservés.
      </div>
    </footer>
  );
}

export async function PublicShell({
  children,
  settings
}: {
  children: React.ReactNode;
  settings?: GarageSettingsView;
}) {
  const garageSettings = settings ?? (await getGarageSettings());

  return (
    <>
      <PublicHeader settings={garageSettings} />
      {children}
      <PublicFooter settings={garageSettings} />
    </>
  );
}
