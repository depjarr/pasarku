import type { ToolId } from "@/lib/alat";

/**
 * Ilustrasi alat masak bergaya peralatan keramik krem dengan gagang kayu.
 * Semua digambar di kanvas 100×80 supaya seragam di grid pemilih alat.
 */
const C = {
  body: "#f2ece2",
  edge: "#d8cdbd",
  inner: "#e5dccd",
  shade: "#e9e1d4",
  wood: "#d6a96f",
  woodDark: "#b9894f",
  glass: "#ffffff",
  dark: "#5a524c",
  window: "#3d3733",
  red: "#e2553f",
};

const Lid = ({ cx, y, rx }: { cx: number; y: number; rx: number }) => (
  <>
    <ellipse cx={cx} cy={y} rx={rx} ry={rx * 0.22} fill={C.glass} fillOpacity={0.55} stroke={C.edge} strokeWidth={1.4} />
    <ellipse cx={cx} cy={y - 4} rx={5} ry={3.6} fill={C.wood} />
    <ellipse cx={cx - 1.4} cy={y - 5.2} rx={1.8} ry={1} fill="#fff" opacity={0.5} />
  </>
);

const art: Record<ToolId, React.ReactNode> = {
  wajan: (
    <>
      <rect x="2" y="30" width="30" height="7" rx="3.5" fill={C.wood} transform="rotate(-8 17 33)" />
      <path d="M28 34 Q50 64 72 64 Q94 64 96 34 Z" fill={C.body} stroke={C.edge} strokeWidth={1.4} />
      <ellipse cx="62" cy="34" rx="34" ry="8" fill={C.inner} stroke={C.edge} strokeWidth={1.4} />
      <path d="M93 33 q7 -1 6 5" fill="none" stroke={C.edge} strokeWidth={3} strokeLinecap="round" />
    </>
  ),
  panci: (
    <>
      <path d="M22 34 h-7 a3 3 0 0 0 0 6 h7" fill="none" stroke={C.edge} strokeWidth={3.2} />
      <path d="M78 34 h7 a3 3 0 0 1 0 6 h-7" fill="none" stroke={C.edge} strokeWidth={3.2} />
      <path d="M22 30 V66 Q22 74 32 74 H68 Q78 74 78 66 V30 Z" fill={C.body} stroke={C.edge} strokeWidth={1.4} />
      <rect x="24" y="44" width="5" height="22" rx="2.5" fill="#fff" opacity={0.55} />
      <Lid cx={50} y={30} rx={30} />
    </>
  ),
  teflon: (
    <>
      <rect x="60" y="40" width="38" height="8" rx="4" fill={C.wood} transform="rotate(-14 79 44)" />
      <ellipse cx="38" cy="50" rx="34" ry="17" fill={C.body} stroke={C.edge} strokeWidth={1.4} />
      <ellipse cx="38" cy="47" rx="28" ry="12.5" fill={C.window} opacity={0.85} />
      <ellipse cx="30" cy="43" rx="9" ry="3" fill="#fff" opacity={0.18} />
    </>
  ),
  kukusan: (
    <>
      <path d="M24 56 V70 Q24 76 32 76 H68 Q76 76 76 70 V56 Z" fill={C.shade} stroke={C.edge} strokeWidth={1.4} />
      <path d="M24 36 V56 H76 V36 Z" fill={C.body} stroke={C.edge} strokeWidth={1.4} />
      {[34, 42, 50, 58, 66].map((x) => (
        <circle key={x} cx={x} cy={50} r={1.6} fill={C.edge} />
      ))}
      <Lid cx={50} y={36} rx={28} />
      <path d="M40 18 q-3 -5 0 -10 M50 16 q-3 -5 0 -10 M60 18 q-3 -5 0 -10" stroke={C.edge} strokeWidth={2} fill="none" strokeLinecap="round" />
    </>
  ),
  "rice-cooker": (
    <>
      <path d="M20 40 Q20 76 50 76 Q80 76 80 40 Z" fill={C.body} stroke={C.edge} strokeWidth={1.4} />
      <path d="M18 40 Q20 18 50 18 Q80 18 82 40 Z" fill={C.shade} stroke={C.edge} strokeWidth={1.4} />
      <rect x="40" y="13" width="20" height="7" rx="3.5" fill={C.wood} />
      <rect x="38" y="50" width="24" height="12" rx="4" fill={C.window} />
      <circle cx="45" cy="56" r="2" fill={C.red} />
      <rect x="50" y="54.5" width="8" height="3" rx="1.5" fill="#9fd3a8" />
    </>
  ),
  "grill-pan": (
    <>
      <rect x="64" y="38" width="34" height="8" rx="4" fill={C.wood} transform="rotate(-10 81 42)" />
      <rect x="6" y="24" width="60" height="44" rx="9" fill={C.body} stroke={C.edge} strokeWidth={1.4} />
      <rect x="12" y="30" width="48" height="32" rx="5" fill={C.window} />
      {[18, 26, 34, 42, 50].map((x) => (
        <path key={x} d={`M${x} 32 l6 28`} stroke="#6f6660" strokeWidth={2.4} strokeLinecap="round" />
      ))}
    </>
  ),
  oven: (
    <>
      <rect x="10" y="14" width="80" height="60" rx="8" fill={C.body} stroke={C.edge} strokeWidth={1.4} />
      <rect x="10" y="14" width="80" height="12" rx="6" fill={C.shade} />
      {[26, 40, 54].map((x) => (
        <circle key={x} cx={x} cy={20} r={3.2} fill={C.wood} />
      ))}
      <rect x="72" y="17" width="12" height="6" rx="2" fill={C.window} />
      <rect x="18" y="32" width="64" height="34" rx="5" fill={C.window} />
      <rect x="22" y="36" width="56" height="4" rx="2" fill="#ffb15c" opacity={0.75} />
      <rect x="26" y="28.5" width="48" height="3" rx="1.5" fill={C.woodDark} />
    </>
  ),
  microwave: (
    <>
      <rect x="8" y="20" width="84" height="50" rx="8" fill={C.body} stroke={C.edge} strokeWidth={1.4} />
      <rect x="14" y="26" width="54" height="38" rx="5" fill={C.window} />
      <rect x="18" y="30" width="16" height="30" rx="3" fill="#fff" opacity={0.08} />
      <rect x="73" y="28" width="13" height="7" rx="2" fill={C.window} />
      {[42, 50, 58].map((y) => (
        <circle key={y} cx={79.5} cy={y} r={2.6} fill={C.wood} />
      ))}
    </>
  ),
  toaster: (
    <>
      <rect x="30" y="10" width="16" height="22" rx="4" fill="#e7b46a" stroke={C.woodDark} strokeWidth={1.2} />
      <rect x="54" y="14" width="16" height="18" rx="4" fill="#e7b46a" stroke={C.woodDark} strokeWidth={1.2} />
      <path d="M16 40 Q16 26 30 26 H70 Q84 26 84 40 V66 Q84 74 76 74 H24 Q16 74 16 66 Z" fill={C.body} stroke={C.edge} strokeWidth={1.4} />
      <rect x="28" y="29" width="20" height="4" rx="2" fill={C.window} />
      <rect x="52" y="29" width="20" height="4" rx="2" fill={C.window} />
      <rect x="84" y="44" width="7" height="12" rx="3" fill={C.wood} />
      <rect x="22" y="48" width="5" height="18" rx="2.5" fill="#fff" opacity={0.55} />
    </>
  ),
  airfryer: (
    <>
      <path d="M24 22 Q24 8 50 8 Q76 8 76 22 V68 Q76 76 68 76 H32 Q24 76 24 68 Z" fill={C.body} stroke={C.edge} strokeWidth={1.4} />
      <rect x="38" y="14" width="24" height="8" rx="3" fill={C.window} />
      <circle cx="50" cy="18" r="2" fill="#ffb15c" />
      <path d="M26 40 H74 V66 Q74 72 68 72 H32 Q26 72 26 66 Z" fill={C.shade} stroke={C.edge} strokeWidth={1.2} />
      <rect x="40" y="50" width="20" height="7" rx="3.5" fill={C.wood} />
    </>
  ),
};

export function ToolArt({ id, className = "h-14 w-[70px]" }: { id: ToolId; className?: string }) {
  return (
    <svg viewBox="0 0 100 80" className={className} aria-hidden>
      {art[id]}
    </svg>
  );
}
