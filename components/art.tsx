import type { ArtKey } from "@/lib/types";

const line = {
  stroke: "#000000",
  strokeWidth: 2.25,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 240 180" aria-hidden="true" className="h-full w-full">
      <rect width="240" height="180" fill="#fffcfd" />
      <rect x="14" y="14" width="212" height="152" fill="#f6e6ea" />
      {children}
    </svg>
  );
}

export function ProductArt({ art }: { art: ArtKey }) {
  return (
    <Frame>
      {art === "roll" && (
        <>
          <ellipse cx="120" cy="118" rx="58" ry="16" {...line} fill="#ffffff" />
          <circle cx="120" cy="86" r="38" {...line} fill="#ffffff" />
          <circle cx="120" cy="86" r="22" {...line} fill="none" />
          <circle cx="120" cy="86" r="8" {...line} fill="#8e5d6a" />
        </>
      )}
      {art === "sandwich" && (
        <>
          <ellipse cx="92" cy="98" rx="36" ry="28" {...line} fill="#ffffff" />
          <ellipse cx="148" cy="98" rx="36" ry="28" {...line} fill="#ffffff" />
          <rect x="108" y="86" width="24" height="24" rx="6" {...line} fill="#f2dde2" />
        </>
      )}
      {art === "cookie" && (
        <>
          <circle cx="120" cy="92" r="46" {...line} fill="#ffffff" />
          <circle cx="104" cy="80" r="4" fill="#000" />
          <circle cx="132" cy="76" r="5" fill="#000" />
          <circle cx="126" cy="104" r="4" fill="#000" />
          <circle cx="108" cy="108" r="3.5" fill="#8e5d6a" />
        </>
      )}
      {art === "brownie" && (
        <>
          <rect x="78" y="58" width="84" height="72" {...line} fill="#ffffff" />
          <path d="M78 82h84M106 58v72M148 58v72" {...line} fill="none" />
          <path d="M96 70c8 6 14-2 22 4" {...line} fill="none" />
        </>
      )}
      {art === "blondie" && (
        <>
          <rect x="76" y="62" width="88" height="64" {...line} fill="#fff7f4" />
          <path d="M76 84h88M120 62v64" {...line} fill="none" />
        </>
      )}
      {art === "krispie" && (
        <>
          <rect x="74" y="64" width="92" height="58" rx="6" {...line} fill="#ffffff" />
          {[0, 1, 2, 3, 4, 5, 6, 7].map((dot) => (
            <circle
              key={dot}
              cx={92 + (dot % 4) * 18}
              cy={80 + Math.floor(dot / 4) * 22}
              r="3"
              fill="#8e5d6a"
            />
          ))}
        </>
      )}
      {art === "whoopie" && (
        <>
          <ellipse cx="120" cy="78" rx="46" ry="22" {...line} fill="#ffffff" />
          <ellipse cx="120" cy="112" rx="46" ry="22" {...line} fill="#ffffff" />
          <path d="M82 95h76" stroke="#8e5d6a" strokeWidth="6" strokeLinecap="round" fill="none" />
        </>
      )}
      {art === "cupcake" && (
        <>
          <path d="M86 108h68l-8 28H94z" {...line} fill="#ffffff" />
          <path d="M86 108c8-8 14 0 22-8s16 0 24 8 16 0 22-8" {...line} fill="#f2dde2" />
          <path d="M108 78c0-16 24-16 24 0 8 0 14 8 8 16H100c-6-8 0-16 8-16z" {...line} fill="#ffffff" />
        </>
      )}
      {art === "muffin" && (
        <>
          <path d="M84 96h72l-10 36H94z" {...line} fill="#ffffff" />
          <path d="M84 96c10-18 22-8 36-16 14 8 26-2 36 16" {...line} fill="#ffffff" />
          <circle cx="112" cy="78" r="4" fill="#8e5d6a" />
          <circle cx="132" cy="70" r="4" fill="#8e5d6a" />
        </>
      )}
      {art === "scone" && <path d="M120 48l52 78H68z" {...line} fill="#ffffff" />}
      {art === "loaf" && (
        <>
          <path d="M62 112c8-36 28-48 58-48s50 12 58 48v16H62z" {...line} fill="#ffffff" />
          <path d="M92 78c8 10 14 10 22 0M126 80c6 8 12 8 18 0" {...line} fill="none" />
        </>
      )}
      {art === "coffee" && (
        <>
          <path d="M58 118h124l-10 18H68z" {...line} fill="#ffffff" />
          <path d="M70 118c6-34 16-46 50-46s44 12 50 46" {...line} fill="#ffffff" />
          <path d="M86 86c10 8 16-6 28 2s18-8 28 0" {...line} fill="none" />
          <circle cx="108" cy="78" r="3" fill="#8e5d6a" />
          <circle cx="138" cy="74" r="3" fill="#8e5d6a" />
        </>
      )}
      {art === "pound" && (
        <>
          <path d="M78 70h84v62H78z" {...line} fill="#ffffff" />
          <path d="M78 88c14-16 28-8 42-16 14 8 28 0 42 16" {...line} fill="none" />
          <path d="M120 72v58" {...line} fill="none" />
        </>
      )}
      {art === "pop" && (
        <>
          <line x1="120" y1="108" x2="120" y2="150" {...line} />
          <circle cx="120" cy="78" r="32" {...line} fill="#f2dde2" />
        </>
      )}
    </Frame>
  );
}
