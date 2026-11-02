// Data restoran untuk halaman Info. GANTI nilai bertanda (ubah) sesuai data asli.
export const INFO = {
  name: "Rumah Makan Hulonthalo",
  tagline: "Kuliner tradisional khas Gorontalo",
  about:
    "Rumah makan tradisional yang sederhana, hangat, dan tenang. Kami menyajikan makanan, minuman, dan kue khas Gorontalo dengan resep warisan.",
  address: "Jl. Contoh No. 1, Kota Gorontalo, Gorontalo", // (ubah)
  hours: [{ label: "Setiap hari", time: "08.00 – 21.00 WITA" }], // (ubah)
  openHour: 8, // jam buka (ubah, 24 jam, WITA)
  closeHour: 21, // jam tutup (ubah)
  highlights: [
    "Olahan jagung dan rempah khas Gorontalo",
    "Bahan lokal segar, cita rasa rumahan",
    "Harga terjangkau, makanan, minuman, dan kue dalam satu tempat",
  ],
};

export function isOpenNow(d: Date = new Date()): boolean {
  const h =
    Number(
      new Intl.DateTimeFormat("en-GB", { hour: "numeric", hour12: false, timeZone: "Asia/Makassar" }).format(d)
    ) % 24;
  return h >= INFO.openHour && h < INFO.closeHour;
}
