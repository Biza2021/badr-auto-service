import Link from "next/link";
import {
  CalendarDays,
  Car,
  ClipboardList,
  FileText,
  Home,
  LogOut,
  Settings,
  Smartphone,
  Users,
  Wrench
} from "lucide-react";
import { logoutAction } from "@/app/admin/login/actions";

const navItems = [
  { href: "/admin", label: "Accueil", icon: Home },
  { href: "/admin/reparations", label: "Réparations", icon: ClipboardList },
  { href: "/admin/clients", label: "Clients", icon: Users },
  { href: "/admin/rendez-vous", label: "Rendez-vous", icon: CalendarDays },
  { href: "/admin/factures", label: "Factures", icon: FileText },
  { href: "/admin/technicien", label: "Technicien", icon: Smartphone },
  { href: "/admin/parametres", label: "Paramètres", icon: Settings }
];

export function AdminShell({
  children,
  user
}: {
  children: React.ReactNode;
  user: { name: string; email: string };
}) {
  return (
    <div className="min-h-screen bg-mist text-slate-900 lg:flex">
      <aside className="border-b border-slate-200 bg-white lg:sticky lg:top-0 lg:h-screen lg:w-72 lg:border-b-0 lg:border-r">
        <div className="flex items-center gap-3 px-4 py-4">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-navy text-white">
            <Wrench className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <p className="font-bold text-navy">Badr Auto Service</p>
            <p className="text-xs font-medium text-slate-500">Gestion atelier</p>
          </div>
        </div>
        <nav className="flex gap-2 overflow-x-auto px-4 pb-4 lg:grid lg:overflow-visible">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                className="flex shrink-0 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-navy"
                href={item.href}
                key={item.href}
              >
                <Icon className="h-4 w-4 text-slate-500" aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="hidden border-t border-slate-200 p-4 lg:block">
          <p className="text-sm font-bold text-navy">{user.name}</p>
          <p className="break-all text-xs text-slate-500">{user.email}</p>
          <form action={logoutAction} className="mt-4">
            <button className="btn-secondary w-full" type="submit">
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Se déconnecter
            </button>
          </form>
        </div>
      </aside>
      <div className="min-w-0 flex-1">
        <header className="border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-navy">{user.name}</p>
              <p className="text-xs text-slate-500">Connecté</p>
            </div>
            <form action={logoutAction}>
              <button className="btn-secondary py-2" type="submit" aria-label="Se déconnecter">
                <LogOut className="h-4 w-4" aria-hidden="true" />
              </button>
            </form>
          </div>
        </header>
        <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
