"use client";

/**
 * Komponen UI bergaya iOS (mengikuti Apple Human Interface Guidelines):
 * status bar, navigation bar dengan large title, tab bar, inset grouped list,
 * stepper, segmented control, dan tombol utama.
 */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { useCartLines } from "@/lib/cart";
import { useHydrated } from "@/lib/useHydrated";

/* ───────────────────────── Ikon (gaya SF Symbols) ───────────────────────── */

type IconProps = { className?: string };
const svg = (path: React.ReactNode, viewBox = "0 0 24 24") =>
  function Icon({ className = "h-6 w-6" }: IconProps) {
    return (
      <svg viewBox={viewBox} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
        {path}
      </svg>
    );
  };

export const ChevronLeft = svg(<path d="M15 4 7 12l8 8" strokeWidth={2.6} />);
export const ChevronRight = svg(<path d="m9 5 7 7-7 7" strokeWidth={2.4} />);
export const StoreIcon = svg(
  <>
    <path d="M4 10v9a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-9" />
    <path d="M3 9.5 4.6 4.7A1 1 0 0 1 5.5 4h13a1 1 0 0 1 .9.7L21 9.5a2.5 2.5 0 0 1-4.5 1.5 2.5 2.5 0 0 1-4.5 0 2.5 2.5 0 0 1-4.5 0A2.5 2.5 0 0 1 3 9.5Z" />
    <path d="M10 20v-5h4v5" />
  </>,
);
export const BasketIcon = svg(
  <>
    <path d="M3.5 9h17l-1.6 9.4a2 2 0 0 1-2 1.6H7.1a2 2 0 0 1-2-1.6Z" />
    <path d="m8 9 3-5M16 9l-3-5M9 13v3M12 13v3M15 13v3" />
  </>,
);
export const SparklesIcon = svg(
  <>
    <path d="M10 3.5 11.6 8a2 2 0 0 0 1.2 1.2L17.5 11l-4.7 1.7a2 2 0 0 0-1.2 1.2L10 18.5l-1.6-4.6a2 2 0 0 0-1.2-1.2L2.5 11l4.7-1.8A2 2 0 0 0 8.4 8Z" />
    <path d="M18.5 3v4M16.5 5h4M19 16v3M17.5 17.5h3" />
  </>,
);
/** Rantang bersusun — ikon koleksi resep */
export const RantangIcon = svg(
  <>
    <path d="M7 6.5V5a5 2.2 0 0 1 10 0v1.5" />
    <rect x="4.5" y="6.5" width="15" height="4.5" rx="1.6" />
    <rect x="4.5" y="11" width="15" height="4.5" rx="1.6" />
    <rect x="4.5" y="15.5" width="15" height="4.5" rx="1.6" />
  </>,
);
export const SearchIcon = svg(<><circle cx="11" cy="11" r="6.5" /><path d="m20 20-4.2-4.2" /></>);
export const XIcon = svg(<path d="M6 6l12 12M18 6 6 18" />);
export const CheckIcon = svg(<path d="m5 12.5 4.5 4.5L19 7" strokeWidth={2.6} />);
export const ClockIcon = svg(<><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></>);
export const FlameIcon = svg(<path d="M12 21c-3.9 0-6.5-2.6-6.5-6.2 0-3.2 2.2-5.3 3.6-7.4.5 1.6 1.4 2.7 2.4 3 .2-2.9 1.6-5.5 3.8-7.4-.2 2.8.8 4.6 2.2 6.4 1.2 1.5 1.5 3 1.5 4.6 0 4-2.7 7-7 7Z" />);
export const PeopleIcon = svg(<><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20a6.5 6.5 0 0 1 13 0" /><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18.5 14.5a6.5 6.5 0 0 1 3 5.5" /></>);
export const ChefIcon = svg(<><path d="M7 14.5V20h10v-5.5" /><path d="M7 14.5A4 4 0 0 1 6 6.6a4.5 4.5 0 0 1 8.6-1.8A3.8 3.8 0 0 1 18 14.5Z" /><path d="M7 17h10" /></>);

/* ───────────────────────── Navigation bar + large title ───────────────────────── */

export function NavBar({
  title,
  large = true,
  back,
  right,
  children,
}: {
  title: string;
  large?: boolean;
  back?: { href: string; label: string };
  right?: React.ReactNode;
  children?: React.ReactNode;
}) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [collapsed, setCollapsed] = useState(!large);

  useEffect(() => {
    if (!large || !titleRef.current) return;
    const io = new IntersectionObserver(([e]) => setCollapsed(!e.isIntersecting), { threshold: 0, rootMargin: "-52px 0px 0px 0px" });
    io.observe(titleRef.current);
    return () => io.disconnect();
  }, [large]);

  return (
    <>
      <header
        className={`sticky top-0 z-30 pt-[env(safe-area-inset-top)] transition-colors ${
          collapsed ? "ios-material border-b border-separator" : "border-b border-transparent bg-transparent"
        }`}
      >
        <div className="grid h-11 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-1 px-2 md:px-6">
          <div className="min-w-0">
            {back && (
              <Link href={back.href} aria-label={back.label} className="flex w-fit max-w-full items-center gap-0.5 rounded-lg py-1 pr-1 text-[17px] text-ios-blue active:opacity-50">
                <ChevronLeft className="h-[22px] w-[22px] shrink-0" />
                {/* seperti iOS: judul panjang di HP → cukup tampilkan panah, label disembunyikan */}
                <span className={`min-w-0 truncate ${title.length > 16 ? "max-md:hidden" : ""}`}>{back.label}</span>
              </Link>
            )}
          </div>
          <span className={`max-w-[62vw] truncate text-center text-[17px] md:max-w-[420px] font-semibold transition-opacity duration-200 ${collapsed ? "opacity-100" : "opacity-0"}`}>
            {title}
          </span>
          <div className="flex justify-end pr-2">{right}</div>
        </div>
      </header>
      {large && (
        <div className="px-4 pb-1 md:px-8 md:pt-2">
          <h1 ref={titleRef} className="text-[34px] font-bold leading-[41px] tracking-[0.01em]">
            {title}
          </h1>
          {children}
        </div>
      )}
    </>
  );
}

/* ───────────────────────── Tab bar ───────────────────────── */

export function TabBar() {
  return (
    <Suspense fallback={<TabBarView path="/" />}>
      <TabBarWithPath />
    </Suspense>
  );
}

function TabBarWithPath() {
  return <TabBarView path={usePathname()} />;
}

function TabBarView({ path }: { path: string }) {
  const hydrated = useHydrated();
  const { count } = useCartLines();
  const tabs = [
    { href: "/", label: "Toko", Icon: StoreIcon, active: path === "/" || path.startsWith("/section") },
    { href: "/keranjang", label: "Keranjang", Icon: BasketIcon, active: path === "/keranjang", badge: hydrated ? count : 0 },
    { href: "/rekomendasi", label: "Menu AI", Icon: SparklesIcon, active: path.startsWith("/rekomendasi") || path.startsWith("/resep/") },
    { href: "/resep-saya", label: "Rantang", Icon: RantangIcon, active: path.startsWith("/resep-saya") },
  ];

  return (
    // HP: bar penuh di bawah (iOS). Tablet: pil melayang (iPadOS). Laptop: disembunyikan (ada sidebar).
    <nav className="ios-material fixed inset-x-0 bottom-0 z-40 border-t border-separator pb-[max(env(safe-area-inset-bottom),8px)] md:inset-x-auto md:bottom-6 md:left-1/2 md:-translate-x-1/2 md:rounded-full md:border md:border-black/[0.06] md:p-1.5 md:shadow-[0_10px_30px_rgba(0,0,0,0.14)] xl:hidden">
      <div className="mx-auto grid max-w-md grid-cols-4 md:flex md:max-w-none md:gap-1">
        {tabs.map(({ href, label, Icon, active, badge }) => (
          <Link
            key={href}
            href={href}
            className={`relative flex flex-col items-center gap-0.5 pt-1.5 text-[10px] font-medium md:flex-row md:gap-2 md:whitespace-nowrap md:rounded-full md:px-5 md:py-2.5 md:text-[15px] ${
              active ? "text-ios-blue md:bg-ios-blue/10" : "text-[#8e8e93] md:text-label"
            }`}
          >
            <span className="relative">
              <Icon className="h-[26px] w-[26px] md:h-[22px] md:w-[22px]" />
              {!!badge && (
                <span key={badge} className="animate-pop absolute -right-2.5 -top-1 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-ios-red px-1 text-[11px] font-semibold text-white">
                  {badge}
                </span>
              )}
            </span>
            {label}
          </Link>
        ))}
      </div>
    </nav>
  );
}

/* ───────────────────────── Inset grouped list ───────────────────────── */

export function Group({ header, footer, children, className = "" }: { header?: React.ReactNode; footer?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={`mx-4 mt-7 md:mx-8 ${className}`}>
      {header && <h3 className="px-1 pb-2 text-[17px] font-semibold">{header}</h3>}
      <div className="overflow-hidden rounded-[10px] bg-card">{children}</div>
      {footer && <p className="px-4 pt-1.5 text-[13px] leading-snug text-secondary">{footer}</p>}
    </section>
  );
}

export function Cell({ leading, children, trailing, onClick, href }: { leading?: React.ReactNode; children: React.ReactNode; trailing?: React.ReactNode; onClick?: () => void; href?: string }) {
  const inner = (
    <>
      {leading && <div className="shrink-0 py-2">{leading}</div>}
      <div className="flex min-h-11 min-w-0 flex-1 items-center gap-3 border-b border-separator py-2.5 pr-4 group-last/cell:border-b-0">
        <div className="min-w-0 flex-1">{children}</div>
        {trailing}
      </div>
    </>
  );
  const cls = "group/cell flex w-full items-center gap-3 pl-4 text-left text-[17px]";
  if (href) return <Link href={href} className={`${cls} active:bg-fill`}>{inner}</Link>;
  if (onClick) return <button onClick={onClick} className={`${cls} active:bg-fill`}>{inner}</button>;
  return <div className={cls}>{inner}</div>;
}

/* ───────────────────────── Kontrol ───────────────────────── */

export function Stepper({ value, onMinus, onPlus, min = 0, max = 99 }: { value?: number; onMinus: () => void; onPlus: () => void; min?: number; max?: number }) {
  return (
    <div className="flex items-center gap-2">
      {value !== undefined && <span className="min-w-5 text-right text-[17px] tabular-nums">{value}</span>}
      <div className="flex h-8 items-center rounded-[8px] bg-fill">
        <button onClick={onMinus} disabled={value !== undefined && value <= min} aria-label="Kurangi" className="grid h-8 w-[46px] place-items-center text-[20px] disabled:opacity-30 active:opacity-40">
          −
        </button>
        <span className="h-[18px] w-px bg-separator" />
        <button onClick={onPlus} disabled={value !== undefined && value >= max} aria-label="Tambah" className="grid h-8 w-[46px] place-items-center text-[20px] disabled:opacity-30 active:opacity-40">
          +
        </button>
      </div>
    </div>
  );
}

export function Segmented<T extends string>({ options, value, onChange }: { options: { value: T; label: string }[]; value: T; onChange: (v: T) => void }) {
  return (
    <div role="tablist" className="flex rounded-[9px] bg-fill p-[2px]">
      {options.map((o) => (
        <button
          key={o.value}
          role="tab"
          aria-selected={value === o.value}
          onClick={() => onChange(o.value)}
          className={`flex-1 truncate rounded-[7px] px-2 py-[5px] text-[13px] transition ${
            value === o.value ? "bg-white font-semibold shadow-[0_3px_8px_rgba(0,0,0,0.12),0_3px_1px_rgba(0,0,0,0.04)]" : "font-medium"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function PrimaryButton({ children, className = "", ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`flex h-[50px] w-full items-center justify-center gap-2 rounded-[14px] bg-brand text-[17px] font-semibold text-white transition active:opacity-70 disabled:opacity-40 ${className}`}
    >
      {children}
    </button>
  );
}
