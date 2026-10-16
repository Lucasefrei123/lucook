export function PiedDePage() {
  return (
    <footer className="mt-auto border-t border-cloison bg-card">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>
          <span className="font-heading text-sm text-foreground">Lucook</span> · des recettes
          composées par IA, à vérifier avant de cuisiner.
        </p>
        <p>
          Composants :{" "}
          <a
            href="https://skiper-ui.com"
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-4 outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/60"
          >
            Skiper UI
          </a>
        </p>
      </div>
    </footer>
  );
}
