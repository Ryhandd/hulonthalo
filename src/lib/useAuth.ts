"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "./supabase";
import { saveProfile } from "./profile";

export type Account = { id: string; email: string; name: string; phone: string };

function toAccount(u: User | null): Account | null {
  if (!u) return null;
  const m = (u.user_metadata ?? {}) as { name?: string; phone?: string };
  return { id: u.id, email: u.email ?? "", name: m.name ?? "", phone: m.phone ?? "" };
}

// undefined = masih memuat, null = belum login
export function useAuth(): Account | null | undefined {
  const [acc, setAcc] = useState<Account | null | undefined>(undefined);
  useEffect(() => {
    let alive = true;
    supabase.auth.getSession().then(({ data }) => alive && setAcc(toAccount(data.session?.user ?? null)));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setAcc(toAccount(s?.user ?? null)));
    return () => { alive = false; sub.subscription.unsubscribe(); };
  }, []);
  return acc;
}

// Kode khusus agar UI bisa menampilkan aksi tambahan (kirim ulang email konfirmasi)
export class AuthError extends Error {
  constructor(message: string, public code?: "not_confirmed") {
    super(message);
  }
}

function explain(err: { message: string; status?: number; code?: string }): AuthError {
  const m = err.message.toLowerCase();
  if (m.includes("email not confirmed") || err.code === "email_not_confirmed")
    return new AuthError("Email belum dikonfirmasi. Buka email Anda dan klik tautan konfirmasi, atau kirim ulang di bawah.", "not_confirmed");
  if (m.includes("invalid login credentials"))
    return new AuthError("Email atau kata sandi salah. Periksa lagi, atau daftar jika belum punya akun.");
  if (m.includes("already registered") || m.includes("already been registered"))
    return new AuthError("Email sudah terdaftar. Silakan masuk.");
  if (m.includes("rate limit") || err.status === 429)
    return new AuthError("Terlalu banyak percobaan. Tunggu beberapa menit lalu coba lagi.");
  if (m.includes("password"))
    return new AuthError("Kata sandi terlalu lemah. Gunakan minimal 6 karakter.");
  if (m.includes("failed to fetch") || m.includes("network"))
    return new AuthError("Tidak bisa terhubung ke server. Periksa koneksi internet dan konfigurasi Supabase.");
  return new AuthError(err.message);
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
  if (error) throw explain(error);
  const a = toAccount(data.user);
  if (a) saveProfile({ name: a.name, phone: a.phone }); // isi otomatis saat memesan
}

// true = langsung masuk (sesi aktif); false = Supabase meminta konfirmasi email dulu.
export async function signUp(v: { name: string; email: string; phone: string; password: string }) {
  const email = v.email.trim().toLowerCase();
  const { data, error } = await supabase.auth.signUp({
    email,
    password: v.password,
    options: { data: { name: v.name.trim(), phone: v.phone.trim() } },
  });
  if (error) throw explain(error);
  // Email sudah terdaftar: Supabase mengembalikan user tanpa identities (tanpa error)
  if (data.user && data.user.identities?.length === 0) throw new AuthError("Email sudah terdaftar. Silakan masuk.");
  saveProfile({ name: v.name.trim(), phone: v.phone.trim() });
  if (data.session) return true; // auto-confirm aktif: sesi langsung tercatat, onAuthStateChange memperbarui UI
  // Tidak ada sesi: coba masuk langsung (berhasil bila konfirmasi email ternyata nonaktif)
  const r = await supabase.auth.signInWithPassword({ email, password: v.password });
  return !r.error;
}

export async function resendConfirmation(email: string) {
  const { error } = await supabase.auth.resend({ type: "signup", email: email.trim().toLowerCase() });
  if (error) throw explain(error);
}

export async function signOut() {
  await supabase.auth.signOut();
}
