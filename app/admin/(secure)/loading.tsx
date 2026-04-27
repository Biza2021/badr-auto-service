export default function AdminLoading() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="surface px-6 py-5 text-center">
        <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-accent" />
        <p className="text-sm font-medium text-slate-700">Chargement de l’espace atelier...</p>
      </div>
    </div>
  );
}
