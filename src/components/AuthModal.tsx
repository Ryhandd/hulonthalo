"use client";

import { useEffect, useState } from "react";
import { signIn, signUp } from "@/lib/useAuth";

const field =
  "h-12 w-full rounded-2xl bg-krim px-4 text-sm outline-none ring-1 ring-terakota/15 focus:ring-2 focus:ring-terakota/40";

export default function AuthModal({ initial, onClose }: { initial: "masuk" | "daftar"; onClose: () => void }) {
  const [mode, setMode] = useState<"masuk" | "daftar">(initial);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (mode === "daftar") {
      if (name.trim().length < 2) return setError("Isi nama lengkap Anda.");
      if (phone.replace(/\D/g, "").length < 8) return setError("Isi nomor HP yang valid.");
    }
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setError("Isi email yang valid.");
    if (password.length < 6) return setError("Kata sandi minimal 6 karakter.");
    setBusy(true);
    try {
      if (mode === "masuk") await signIn(email, password);
      else await signUp({ name, email, phone, password });
      onClose(); // sudah login
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan. Coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-arang/50 sm:items-center" onClick={onClose} role="dialog" aria-modal="true" aria-label={mode === "masuk" ? "Masuk" : "Daftar"}>
      <div className="w-full max-w-md animate-bar-in rounded-t-3xl bg-white p-6 shadow-xl sm:rounded-3xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-terakota">{mode === "masuk" ? "Masuk" : "Buat akun"}</h2>
            <p className="mt-0.5 text-xs text-arang/60">
              {mode === "masuk" ? "Selamat datang kembali di Hulonthalo." : "Daftar agar data pemesan terisi otomatis."}
            </p>
          </div>
          <button onClick={onClose} aria-label="Tutup" className="grid h-9 w-9 place-items-center rounded-full text-xl text-arang/50 hover:bg-arang/5">×</button>
        </div>

        <div className="mt-4 grid grid-cols-2 rounded-full bg-krim p-1 text-sm font-semibold">
          {(["masuk", "daftar"] as const).map((m) => (
            <button key={m} type="button" onClick={() => { setMode(m); setError(null); }}
              className={`h-10 rounded-full transition ${mode === m ? "bg-terakota text-krim shadow-sm" : "text-arang/60"}`}>
              {m === "masuk" ? "Sign In" : "Sign Up"}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="mt-4 space-y-3">
          {mode === "daftar" && (
            <>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama lengkap" autoComplete="name" className={field} />
              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Nomor HP / WhatsApp" inputMode="tel" autoComplete="tel" className={field} />
            </>
          )}
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" autoComplete="email" className={field} />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Kata sandi (min. 6 karakter)" autoComplete={mode === "masuk" ? "current-password" : "new-password"} className={field} />
          {error && <p role="alert" className="rounded-2xl bg-terakota/10 px-4 py-3 text-sm text-terakota-dark">{error}</p>}
          <button disabled={busy} className="h-12 w-full rounded-full bg-terakota text-sm font-semibold text-krim shadow-sm transition hover:bg-terakota-dark active:scale-[.98] disabled:opacity-60">
            {busy ? "Memproses..." : mode === "masuk" ? "Masuk" : "Daftar"}
          </button>
        </form>
      </div>
    </div>
  );
}
