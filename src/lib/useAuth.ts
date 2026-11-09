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

// undefined = masih memuat, null = belum login (Tamu)
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

function explain(err: { message: string; status?: number }): Error {
  const m = err.message.toLowerCase();
  if (m.includes("invalid login credentials")) return new Error("Email atau kata sandi salah. Periksa lagi, atau daftar jika belum punya akun.");
  if (m.includes("rate limit") || err.status === 429) return new Error("Terlalu banyak percobaan. Tunggu beberapa menit lalu coba lagi.");
  if (m.includes("failed to fetch") || m.includes("network")) return new Error("Tidak bisa terhubung ke server. Periksa koneksi internet.");
  return new Error(err.message);
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
  if (error) throw explain(error);
  const a = toAccount(data.user);
  if (a) saveProfile({ name: a.name, phone: a.phone }); // isi otomatis saat memesan
}

// Daftar lewat server (akun langsung aktif), lalu masuk otomatis.
export async function signUp(v: { name: string; email: string; phone: string; password: string }) {
  const email = v.email.trim().toLowerCase();
  let res: Response;
  try {
    res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: v.name, phone: v.phone, email, password: v.password }),
    });
  } catch {
    throw new Error("Tidak bisa terhubung ke server. Periksa koneksi internet.");
  }
  const body = (await res.json().catch(() => ({}))) as { error?: string };
  if (!res.ok) throw new Error(body.error ?? "Pendaftaran gagal. Coba lagi.");
  await signIn(email, v.password);
}

export async function signOut() {
  await supabase.auth.signOut();
}
