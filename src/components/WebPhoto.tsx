"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from "react";

type Photo = { url: string; thumb: string; source: string; link: string };

// cache di browser: kata kunci yang sama tidak dicari ulang selama halaman terbuka
const cache = new Map<string, Promise<Photo[]>>();
function searchPhotos(q: string) {
  const key = q.trim().toLowerCase();
  if (!cache.has(key)) {
    cache.set(
      key,
      fetch(`/api/foto?q=${encodeURIComponent(q)}`)
        .then((r) => r.json())
        .then((d: { photos?: Photo[] }) => d.photos ?? [])
        .catch(() => []),
    );
  }
  return cache.get(key)!;
}

/**
 * Foto dari Google Images (lewat /api/foto) untuk sebuah kata kunci.
 * Urutan percobaan: gambar asli → thumbnail Google → hasil berikutnya → `fallback`.
 */
export function WebPhoto({
  query,
  fallback,
  className = "",
  showSource = true,
}: {
  query: string;
  fallback: React.ReactNode;
  className?: string;
  showSource?: boolean;
}) {
  const [photos, setPhotos] = useState<Photo[] | null>(null);
  const [attempt, setAttempt] = useState(0); // indeks percobaan: 0=url foto 1, 1=thumb foto 1, 2=url foto 2, ...

  useEffect(() => {
    let alive = true;
    searchPhotos(query).then((p) => {
      if (!alive) return;
      setPhotos(p);
      setAttempt(0);
    });
    return () => {
      alive = false;
    };
  }, [query]);

  if (photos === null) return <div className={`skeleton ${className}`} />;

  const photo = photos[Math.floor(attempt / 2)];
  if (!photo) return <>{fallback}</>;
  const src = attempt % 2 === 0 ? photo.url : photo.thumb;

  return (
    // posisi (relative/absolute) ditentukan lewat className pemanggil supaya tidak bentrok
    <div className={`overflow-hidden ${/\babsolute\b/.test(className) ? "" : "relative"} ${className}`}>
      <img
        key={src}
        src={src}
        alt={query}
        referrerPolicy="no-referrer"
        onError={() => setAttempt((a) => a + 1)}
        className="h-full w-full object-cover"
      />
      {showSource && photo.source && (
        <span className="absolute bottom-1 left-1 max-w-[80%] truncate rounded bg-black/45 px-1.5 py-0.5 text-[9px] text-white/90">
          {photo.source}
        </span>
      )}
    </div>
  );
}
