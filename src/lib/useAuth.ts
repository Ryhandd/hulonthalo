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

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
  if (error) throw new Error("Email atau kata sandi salah.");
  const a = toAccount(data.user);
  if (a) saveProfile({ name: a.name, phone: a.phone }); // isi otomatis saat memesan
}

// Mengembalikan true bila langsung masuk, false bila perlu konfirmasi email.
export async function signUp(v: { name: string; email: string; phone: string; password: string }) {
  const { data, error } = await supabase.auth.signUp({
    email: v.email.trim(),
    password: v.password,
    options: { data: { name: v.name.trim(), phone: v.phone.trim() } },
  });
  if (error) throw new Error(error.message.toLowerCase().includes("registered") ? "Email sudah terdaftar. Silakan masuk." : error.message);
  if (data.user && data.user.identities?.length === 0) throw new Error("Email sudah terdaftar. Silakan masuk.");
  saveProfile({ name: v.name.trim(), phone: v.phone.trim() });
  return Boolean(data.session);
}

export async function signOut() {
  await supabase.auth.signOut();
}
