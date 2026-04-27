export default function Loading() {
  return (
    <main className="min-h-screen bg-mist">
      <div className="container-page flex min-h-screen items-center justify-center">
        <div className="surface px-6 py-5 text-center">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-accent" />
          <p className="text-sm font-medium text-slate-700">Chargement en cours...</p>
        </div>
      </div>
    </main>
  );
}
