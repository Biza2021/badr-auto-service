import Link from "next/link";
import {
  CalendarDays,
  ClipboardList,
  FileText,
  Home,
  LogOut,
  Menu,
  Settings,
  Smartphone,
  UserCog,
  Users,
  Wrench
} from "lucide-react";
import { logoutAction } from "@/app/admin/login/actions";
import { displayStaffName } from "@/lib/display";

const adminNavItems = [
  { href: "/admin", label: "Accueil", icon: Home },
  { href: "/admin/reparations", label: "Réparations", icon: ClipboardList },
  { href: "/admin/clients", label: "Clients", icon: Users },
  { href: "/admin/rendez-vous", label: "Rendez-vous", icon: CalendarDays },
  { href: "/admin/factures", label: "Factures", icon: FileText },
  { href: "/admin/technicien", label: "Technicien", icon: Smartphone },
  { href: "/admin/techniciens", label: "Techniciens", icon: UserCog },
  { href: "/admin/parametres", label: "Paramètres", icon: Settings }
];

const technicianNavItems = [
  { href: "/admin/technicien", label: "Espace technicien", icon: Smartphone }
];

export function AdminShell({
  children,
  user
}: {
  children: React.ReactNode;
  user: { name: string; email: string; role: "ADMIN" | "TECHNICIAN" };
}) {
  const displayName = displayStaffName(user.name);
  const navItems = user.role === "ADMIN" ? adminNavItems : technicianNavItems;

  return (
    <div className="min-h-screen bg-mist text-slate-900 lg:flex">
      <aside className="hidden border-r border-slate-200 bg-white lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-72 lg:flex-col">
        <div className="flex items-center gap-3 px-5 py-5">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-navy text-white">
            <Wrench className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <p className="font-bold text-navy">Badr Auto Service</p>
            <p className="text-xs font-medium text-slate-500">Gestion atelier</p>
          </div>
        </div>
        <nav className="grid gap-1 px-4 pb-5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-navy"
                href={item.href}
                key={item.href}
              >
                <Icon className="h-4 w-4 text-slate-500" aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto border-t border-slate-200 p-4">
          <p className="text-sm font-bold text-navy">{displayName}</p>
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
        <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
          <details className="group">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-navy text-white">
                  <Wrench className="h-5 w-5" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-navy">Badr Auto Service</p>
                  <p className="truncate text-xs text-slate-500">{displayName} · Espace équipe</p>
                </div>
              </div>
              <span className="btn-secondary px-3 py-2" aria-hidden="true">
                <Menu className="h-4 w-4" />
              </span>
            </summary>
            <div className="mt-3 grid gap-2 border-t border-slate-200 pt-3">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    className="flex items-center gap-3 rounded-lg bg-slate-50 px-3 py-3 text-sm font-semibold text-slate-800"
                    href={item.href}
                    key={item.href}
                  >
                    <Icon className="h-4 w-4 text-slate-500" aria-hidden="true" />
                    {item.label}
                  </Link>
                );
              })}
              <div className="mt-2 rounded-lg border border-slate-200 p-3">
                <p className="text-sm font-bold text-navy">{displayName}</p>
                <p className="break-all text-xs text-slate-500">{user.email}</p>
              </div>
              <form action={logoutAction}>
                <button className="btn-secondary w-full" type="submit">
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  Se déconnecter
                </button>
              </form>
            </div>
          </details>
        </header>
        <main className="px-4 py-5 sm:px-6 lg:px-8 lg:py-7">{children}</main>
      </div>
    </div>
  );
}
