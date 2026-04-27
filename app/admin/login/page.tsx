import type { Metadata } from "next";
import Link from "next/link";
import { LockKeyhole, Wrench } from "lucide-react";
import { PendingButton } from "@/components/pending-button";
import { loginAction } from "./actions";

export const metadata: Metadata = {
  title: "Connexion équipe"
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function LoginPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const error = typeof params.erreur === "string" ? params.erreur : null;

  return (
    <main className="min-h-screen bg-navy px-4 py-10 text-white">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-md items-center">
        <section className="w-full rounded-lg bg-white p-6 text-slate-900 shadow-soft">
          <Link href="/" className="mb-8 flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-navy text-white">
              <Wrench className="h-5 w-5" aria-hidden="true" />
            </span>
            <span>
              <span className="block text-lg font-bold text-navy">Badr Auto Service</span>
              <span className="block text-sm text-slate-500">Espace équipe</span>
            </span>
          </Link>
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-50 text-accent">
            <LockKeyhole className="h-6 w-6" aria-hidden="true" />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-navy">Connexion admin</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Connectez-vous pour gérer les rendez-vous, réparations, clients et factures.
          </p>
          {error ? (
            <div className="mt-5 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-800">
              {error}
            </div>
          ) : null}
          <form action={loginAction} className="mt-6 grid gap-4">
            <label>
              <span className="field-label">Adresse e-mail</span>
              <input className="field-input" name="email" required type="email" />
            </label>
            <label>
              <span className="field-label">Mot de passe</span>
              <input className="field-input" name="password" required type="password" />
            </label>
            <PendingButton pendingLabel="Connexion...">Se connecter</PendingButton>
          </form>
        </section>
      </div>
    </main>
  );
}
