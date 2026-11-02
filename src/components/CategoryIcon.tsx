// Ikon placeholder per kategori (dipakai saat menu belum punya foto)
export default function CategoryIcon({ slug, className }: { slug?: string; className?: string }) {
  const p = {
    width: 40, height: 40, viewBox: "0 0 48 48", fill: "none", stroke: "currentColor",
    strokeWidth: 2.4, strokeLinecap: "round" as const, strokeLinejoin: "round" as const,
    className, "aria-hidden": true,
  };
  if (slug === "minuman")
    return (<svg {...p}><path d="M12 12h24l-3 28H15L12 12z" /><path d="M13 21h22" /><path d="M28 12l4-7" /></svg>);
  if (slug === "kue")
    return (<svg {...p}><path d="M8 30c0-9 7-16 16-16s16 7 16 16H8z" /><path d="M8 30h32v4a4 4 0 01-4 4H12a4 4 0 01-4-4v-4z" /></svg>);
  return (<svg {...p}><path d="M6 22h36c0 10-7 18-18 18S6 32 6 22z" /><path d="M16 16c0-3 3-3 3-6M24 16c0-3 3-3 3-6M32 16c0-3 3-3 3-6" /></svg>);
}
