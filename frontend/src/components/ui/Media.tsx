import Image from 'next/image';

/**
 * Image primitives.
 *
 * Sources are remote in dev/demo (see next.config remotePatterns). Every one
 * degrades to a typed placeholder rather than a broken box, because seeded and
 * user-created records will not all carry imagery.
 */

/** Deterministic tint from a string, so the same asset always gets the same hue. */
function hue(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i += 1) h = (h * 31 + seed.charCodeAt(i)) % 360;
  return h;
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

/**
 * 16:9 cover for an opportunity or tender. `priority` for above-the-fold heroes.
 */
export function CoverImage({
  src,
  alt,
  seed,
  className = '',
  sizes = '(max-width: 768px) 100vw, 33vw',
  priority = false,
}: {
  src?: string | null;
  alt: string;
  seed?: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  const h = hue(seed ?? alt);
  return (
    <div className={`relative aspect-video overflow-hidden bg-foreground/5 ${className}`}>
      {src ? (
        <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className="object-cover" />
      ) : (
        <div
          aria-hidden
          className="grid h-full w-full place-items-center text-2xl font-semibold text-white/70"
          style={{
            background: `linear-gradient(135deg, hsl(${h} 45% 32%), hsl(${(h + 40) % 360} 45% 22%))`,
          }}
        >
          {initials(alt)}
        </div>
      )}
    </div>
  );
}

/**
 * Round profile image for a user, or a square-ish mark for a company.
 * Remote avatars are SVG, so they bypass the optimizer.
 */
export function Avatar({
  src,
  name,
  size = 36,
  rounded = 'full',
}: {
  src?: string | null;
  name: string;
  size?: number;
  rounded?: 'full' | 'lg';
}) {
  const shape = rounded === 'full' ? 'rounded-full' : 'rounded-lg';
  const h = hue(name);
  if (src) {
    return (
      <Image
        src={src}
        alt={name}
        width={size}
        height={size}
        unoptimized
        className={`${shape} shrink-0 bg-foreground/5 object-cover`}
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <span
      aria-hidden
      className={`${shape} grid shrink-0 place-items-center font-semibold text-white`}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.4,
        background: `hsl(${h} 45% 38%)`,
      }}
    >
      {initials(name)}
    </span>
  );
}

/** Horizontal thumbnail strip. Renders nothing when there is no gallery. */
export function Gallery({ urls, alt }: { urls: string[]; alt: string }) {
  if (!urls?.length) return null;
  return (
    <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4">
      {urls.map((u, i) => (
        <div key={u} className="relative aspect-[4/3] overflow-hidden rounded-lg bg-foreground/5">
          <Image
            src={u}
            alt={`${alt} — view ${i + 1}`}
            fill
            sizes="(max-width: 640px) 33vw, 20vw"
            className="object-cover transition-transform duration-300 hover:scale-105"
          />
        </div>
      ))}
    </div>
  );
}
