import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/server/supabaseAdmin";

export const runtime = "nodejs";

// Membuat akun yang LANGSUNG terkonfirmasi (tanpa verifikasi email), apa pun pengaturan dashboard Supabase.
export async function POST(req: Request) {
  const b = await req.json().catch(() => null);
  const name = String(b?.name ?? "").trim();
  const phone = String(b?.phone ?? "").trim();
  const email = String(b?.email ?? "").trim().toLowerCase();
  const password = String(b?.password ?? "");
  if (name.length < 2 || phone.replace(/\D/g, "").length < 8 || !/^\S+@\S+\.\S+$/.test(email) || password.length < 6)
    return NextResponse.json({ error: "Data pendaftaran tidak valid." }, { status: 400 });

  try {
    const { error } = await supabaseAdmin().auth.admin.createUser({
      email, password, email_confirm: true, user_metadata: { name, phone },
    });
    if (error) {
      const exists = error.code === "email_exists" || /already/i.test(error.message);
      return NextResponse.json({ error: exists ? "Email sudah terdaftar. Silakan masuk." : error.message }, { status: exists ? 409 : 400 });
    }
    return NextResponse.json({ status: "confirmed" });
  } catch (e) {
    console.error("[signup]", e);
    return NextResponse.json({ error: e instanceof Error ? e.message : "Terjadi kesalahan server." }, { status: 500 });
  }
}
