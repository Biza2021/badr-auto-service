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
    <div className="mb-5 flex flex-col gap-3 sm:mb-6 lg:flex-row lg:items-end lg:justify-between">
      <div className="min-w-0">
        {eyebrow ? (
          <p className="text-xs font-bold uppercase tracking-wide text-accent sm:text-sm">{eyebrow}</p>
        ) : null}
        <h1 className="mt-1 text-2xl font-bold text-navy sm:text-3xl">{title}</h1>
        {text ? <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{text}</p> : null}
      </div>
      {action ? (
        <div className="print-hidden flex shrink-0 flex-col gap-2 sm:flex-row sm:flex-wrap [&>*]:w-full sm:[&>*]:w-auto">
          {action}
        </div>
      ) : null}
    </div>
  );
}
