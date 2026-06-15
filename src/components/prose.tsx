export function Prose({
  title,
  intro,
  updated,
  children,
}: {
  title: string;
  intro?: string;
  updated?: string;
  children: React.ReactNode;
}) {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-12">
      <h1 className="font-heading text-3xl font-semibold tracking-tight">
        {title}
      </h1>
      {intro && <p className="mt-3 text-lg text-muted-foreground">{intro}</p>}
      {updated && (
        <p className="mt-2 text-sm text-muted-foreground">Last updated {updated}</p>
      )}
      <div className="mt-8 flex flex-col gap-4 text-sm leading-relaxed text-foreground [&_a]:text-foreground [&_a]:underline [&_h2]:mt-6 [&_h2]:font-heading [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-foreground [&_li]:mt-1 [&_p]:text-muted-foreground [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:text-muted-foreground">
        {children}
      </div>
    </main>
  );
}
