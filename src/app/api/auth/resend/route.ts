import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/server/supabaseAdmin";
import { emailEnabled, sendVerificationEmail } from "@/lib/server/mailer";

export const runtime = "nodejs";

// Kirim ulang tautan verifikasi. Tautan hanya dikirim ke email pemilik, tidak pernah dikembalikan ke browser.
export async function POST(req: Request) {
  const b = await req.json().catch(() => null);
  const email = String(b?.email ?? "").trim().toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(email)) return NextResponse.json({ error: "Email tidak valid." }, { status: 400 });
  if (!emailEnabled())
    return NextResponse.json({ error: "Mode development: email tidak dikirim. Hapus akun ini di Supabase > Authentication > Users lalu daftar ulang." }, { status: 400 });
  try {
    const site = process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin;
    const { data, error } = await supabaseAdmin().auth.admin.generateLink({ type: "magiclink", email, options: { redirectTo: `${site}/info` } });
    // Respons selalu sama agar tidak membocorkan apakah email terdaftar
    if (!error && data?.properties?.action_link) {
      const name = (data.user?.user_metadata as { name?: string } | undefined)?.name ?? "";
      await sendVerificationEmail(email, name, data.properties.action_link);
    }
    return NextResponse.json({ status: "sent" });
  } catch (e) {
    console.error("[resend]", e);
    return NextResponse.json({ error: e instanceof Error ? e.message : "Terjadi kesalahan server." }, { status: 500 });
  }
}
