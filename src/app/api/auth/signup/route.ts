import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/server/supabaseAdmin";
import { emailEnabled, sendVerificationEmail } from "@/lib/server/mailer";

export const runtime = "nodejs";

// Respons: { status: "confirmed" }    -> mode dev, akun langsung aktif (klien lanjut login)
//          { status: "verify_email" } -> email verifikasi dikirim lewat Resend
export async function POST(req: Request) {
  const b = await req.json().catch(() => null);
  const name = String(b?.name ?? "").trim();
  const phone = String(b?.phone ?? "").trim();
  const email = String(b?.email ?? "").trim().toLowerCase();
  const password = String(b?.password ?? "");
  if (name.length < 2 || phone.replace(/\D/g, "").length < 8 || !/^\S+@\S+\.\S+$/.test(email) || password.length < 6)
    return NextResponse.json({ error: "Data pendaftaran tidak valid." }, { status: 400 });

  try {
    const admin = supabaseAdmin();
    const meta = { name, phone };

    if (!emailEnabled()) {
      // MODE DEVELOPMENT: tanpa RESEND_API_KEY, akun langsung dikonfirmasi.
      const { error } = await admin.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: meta });
      if (error) {
        const exists = error.code === "email_exists" || /already/i.test(error.message);
        return NextResponse.json({ error: exists ? "Email sudah terdaftar. Silakan masuk." : error.message }, { status: exists ? 409 : 400 });
      }
      return NextResponse.json({ status: "confirmed" });
    }

    // MODE PRODUKSI: buat akun belum terkonfirmasi + tautan verifikasi, kirim lewat Resend.
    const site = process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin;
    const { data, error } = await admin.auth.admin.generateLink({
      type: "signup", email, password, options: { data: meta, redirectTo: `${site}/info` },
    });
    if (error || !data?.properties?.action_link) {
      const exists = error?.code === "email_exists" || /already/i.test(error?.message ?? "");
      return NextResponse.json({ error: exists ? "Email sudah terdaftar. Silakan masuk." : error?.message ?? "Gagal membuat akun." }, { status: exists ? 409 : 400 });
    }
    await sendVerificationEmail(email, name, data.properties.action_link);
    return NextResponse.json({ status: "verify_email" });
  } catch (e) {
    console.error("[signup]", e);
    return NextResponse.json({ error: e instanceof Error ? e.message : "Terjadi kesalahan server." }, { status: 500 });
  }
}
