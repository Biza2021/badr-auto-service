"use client";

export default function ErrorPage({
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="min-h-screen bg-mist">
      <div className="container-page flex min-h-screen items-center justify-center">
        <div className="surface max-w-md px-6 py-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-accent">Erreur</p>
          <h1 className="mt-2 text-2xl font-bold text-navy">Une erreur est survenue</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            La page n&apos;a pas pu se charger correctement. Veuillez réessayer dans un instant.
          </p>
          <button className="btn-primary mt-5" onClick={reset}>
            Réessayer
          </button>
        </div>
      </div>
    </main>
  );
}
