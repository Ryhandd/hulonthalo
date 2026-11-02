// Foto bawaan menu (file ada di public/menu). Dipakai jika kolom image_url di database masih kosong.
// Kunci = nama menu persis seperti di tabel menu_items.
const FOTO: Record<string, string> = {
  "Binte Biluhuta (Milu Siram)": "binte-biluhuta",
  "Nasi Ayam Iloni + Sayur": "nasi-ayam-iloni",
  "Nasi Tabu Moitomo": "nasi-tabu-moitomo",
  "Nasi Sate Tuna Gorontalo": "nasi-sate-tuna",
  "Nasi Bilenthango + Sayur": "nasi-bilenthango",
  "Payanga Bumbu Kuning": "payanga-bumbu-kuning",
  "Ilepao (Sagu Isian Ikan/Jeroan)": "ilepao",
  "Ike Moitomo": "ike-moitomo",
  "Perkedel Milu (Perkedel Jagung)": "perkedel-milu",
  "Sambal Sagela / Pomaia": "sambal-sagela",
  "Es Brenebon Cokelat": "es-brenebon-cokelat",
  "Es Oji (Kelapa Muda Jeruk Nipis)": "es-oji",
  "Kopi Pinogu Otentik": "kopi-pinogu",
  "Es Kelapa Gula Merah": "es-kelapa-gula-merah",
  "Saraba Rempah Gorontalo": "saraba",
  "Teh Manis": "teh-manis",
  "Teh Susu": "teh-susu",
  "Air Mineral": "air-mineral",
  "Popaco": "popaco",
  "Cucur Gorontalo": "cucur-gorontalo",
  "Sabongi": "sabongi",
  "Cara Isi": "cara-isi",
  "Kue Tobu'u": "kue-tobuu",
  "Kue Tolu": "kue-tolu",
  "Kue Pinuku": "kue-pinuku",
  "Kue Kolombengi": "kue-kolombengi",
};

const norm = (s: string) => s.trim().toLowerCase().replace(/[’‘]/g, "'");
const INDEX = new Map(Object.entries(FOTO).map(([nama, file]) => [norm(nama), `/menu/${file}.webp`]));

export function fotoMenu(nama: string, imageUrl: string | null): string | null {
  return imageUrl || INDEX.get(norm(nama)) || null;
}
