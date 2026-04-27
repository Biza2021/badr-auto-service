export function AdminPageHeader({
  eyebrow,
  title,
  text,
  action
}: {
  eyebrow?: string;
  title: string;
  text?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        {eyebrow ? (
          <p className="text-sm font-bold uppercase tracking-wide text-accent">{eyebrow}</p>
        ) : null}
        <h1 className="mt-1 text-3xl font-bold text-navy">{title}</h1>
        {text ? <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{text}</p> : null}
      </div>
      {action ? <div className="flex shrink-0 flex-wrap gap-2">{action}</div> : null}
    </div>
  );
}
