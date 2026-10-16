import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

function Bloc({ className }: { className?: string }) {
  return <Skeleton className={cn("rounded-[2px] bg-muted motion-reduce:animate-none", className)} />;
}

function Cadre({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 md:py-10" aria-busy="true">
      <p className="sr-only" role="status">
        Chargement…
      </p>
      {children}
    </main>
  );
}

export function SqueletteEntete() {
  return (
    <div className="mb-6 flex flex-col gap-3">
      <Bloc className="h-3 w-40" />
      <Bloc className="h-9 w-72 max-w-full" />
    </div>
  );
}

export function SqueletteAccueil() {
  return (
    <Cadre>
      <div className="mb-6 grid gap-px border border-cloison bg-cloison md:grid-cols-3">
        <div className="flex flex-col gap-3 bg-card p-6 md:col-span-2 md:p-8">
          <Bloc className="h-3 w-40" />
          <Bloc className="h-10 w-80 max-w-full" />
          <Bloc className="h-4 w-full max-w-md" />
        </div>
        <div className="flex flex-col gap-3 bg-card p-6">
          <Bloc className="h-5 w-32" />
          <Bloc className="h-4 w-full" />
          <Bloc className="h-4 w-2/3" />
        </div>
      </div>
      <div className="grid gap-px border border-cloison bg-cloison">
        <div className="grid gap-px bg-cloison md:h-56 md:grid-cols-[3fr_1fr_1fr]">
          <div className="h-20 bg-card md:h-auto" />
          <div className="h-20 bg-card md:h-auto" />
          <div className="h-20 bg-card md:h-auto" />
        </div>
        <div className="grid gap-6 bg-card p-5 md:grid-cols-2 md:p-8">
          <Bloc className="h-36" />
          <Bloc className="h-36" />
        </div>
      </div>
    </Cadre>
  );
}

export function SqueletteGrilleRecettes({ nombre = 6 }: { nombre?: number }) {
  return (
    <Cadre>
      <SqueletteEntete />
      <Bloc className="mb-6 h-16 w-full" />
      <div className="grid gap-px border border-cloison bg-cloison sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: nombre }, (_, index) => (
          <div key={index} className="flex min-h-56 flex-col gap-3 bg-card p-6">
            <Bloc className="h-4 w-16" />
            <Bloc className="h-6 w-3/4" />
            <Bloc className="h-4 w-full" />
            <Bloc className="mt-auto h-3 w-1/2" />
          </div>
        ))}
      </div>
    </Cadre>
  );
}

export function SqueletteGeneration() {
  return (
    <Cadre>
      <SqueletteEntete />
      <div className="grid gap-px border border-cloison bg-cloison md:grid-cols-3 md:grid-rows-2">
        <div className="flex min-h-56 flex-col gap-3 bg-card p-6 md:col-span-2 md:row-span-2">
          <Bloc className="h-8 w-2/3" />
          <Bloc className="h-4 w-full" />
          <Bloc className="h-4 w-5/6" />
        </div>
        <div className="flex min-h-56 flex-col gap-3 bg-card p-6">
          <Bloc className="h-6 w-3/4" />
          <Bloc className="h-4 w-full" />
        </div>
        <div className="flex min-h-56 flex-col gap-3 bg-card p-6">
          <Bloc className="h-6 w-3/4" />
          <Bloc className="h-4 w-full" />
        </div>
      </div>
    </Cadre>
  );
}

export function SqueletteRecette() {
  return (
    <Cadre>
      <Bloc className="mb-5 h-4 w-28" />
      <div className="grid gap-px border border-cloison bg-cloison lg:grid-cols-[5fr_7fr]">
        <div className="flex flex-col gap-4 bg-card p-6 md:p-8 lg:col-span-2">
          <Bloc className="h-3 w-40" />
          <Bloc className="h-12 w-3/4" />
          <Bloc className="h-4 w-full max-w-xl" />
        </div>
        <div className="flex flex-col gap-3 bg-card p-6 md:p-8">
          {Array.from({ length: 7 }, (_, index) => (
            <Bloc key={index} className="h-5 w-full" />
          ))}
        </div>
        <div className="flex flex-col gap-5 bg-card p-6 md:p-8">
          {Array.from({ length: 5 }, (_, index) => (
            <Bloc key={index} className="h-10 w-full" />
          ))}
        </div>
      </div>
    </Cadre>
  );
}

export function SqueletteGenerique() {
  return (
    <Cadre>
      <SqueletteEntete />
      <div className="grid gap-px border border-cloison bg-cloison md:grid-cols-2">
        <div className="flex min-h-48 flex-col gap-3 bg-card p-6">
          <Bloc className="h-6 w-1/2" />
          <Bloc className="h-4 w-full" />
        </div>
        <div className="flex min-h-48 flex-col gap-3 bg-card p-6">
          <Bloc className="h-6 w-1/2" />
          <Bloc className="h-4 w-full" />
        </div>
      </div>
    </Cadre>
  );
}

export function SqueletteProfil() {
  return (
    <Cadre>
      <SqueletteEntete />
      <div className="grid gap-px border border-cloison bg-cloison">
        {Array.from({ length: 3 }, (_, index) => (
          <div key={index} className="flex flex-col gap-3 bg-card p-5 md:p-8">
            <Bloc className="h-4 w-40" />
            <Bloc className="h-24 w-full" />
          </div>
        ))}
      </div>
    </Cadre>
  );
}
