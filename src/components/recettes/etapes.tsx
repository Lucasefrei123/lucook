export function Etapes({ etapes }: { etapes: string[] }) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl">Préparation</h2>
      <ol className="flex flex-col gap-5">
        {etapes.map((etape, index) => (
          <li key={index} className="grid grid-cols-[auto_1fr] gap-4">
            <span
              aria-hidden="true"
              className="grid size-8 place-items-center rounded-[2px] bg-primary font-mono text-sm text-primary-foreground"
            >
              {index + 1}
            </span>
            <p className="pt-1 leading-relaxed">
              <span className="sr-only">Étape {index + 1} : </span>
              {etape}
            </p>
          </li>
        ))}
      </ol>
    </div>
  );
}
