// Profil pengguna dan riwayat pesanan disimpan di perangkat (tanpa login pelanggan).
const PROFILE_KEY = "hulonthalo-profile-v1";
const ORDERS_KEY = "hulonthalo-orders-v1";

export type Profile = { name: string; phone: string };

export function loadProfile(): Profile {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (raw) return { name: "", phone: "", ...JSON.parse(raw) };
  } catch {}
  return { name: "", phone: "" };
}

export function saveProfile(p: Profile) {
  try { localStorage.setItem(PROFILE_KEY, JSON.stringify(p)); } catch {}
}

export function loadOrderIds(): string[] {
  try {
    const raw = localStorage.getItem(ORDERS_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export function addOrderId(id: string) {
  try {
    const ids = [id, ...loadOrderIds().filter((x) => x !== id)].slice(0, 30);
    localStorage.setItem(ORDERS_KEY, JSON.stringify(ids));
  } catch {}
}
