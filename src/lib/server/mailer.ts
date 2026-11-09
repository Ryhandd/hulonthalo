// Pengirim email via Resend REST API (tanpa SDK tambahan).
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));

export const emailEnabled = () => Boolean(process.env.RESEND_API_KEY);

export async function sendVerificationEmail(to: string, name: string, link: string) {
  const from = process.env.EMAIL_FROM || "Rumah Makan Hulonthalo <onboarding@resend.dev>";
  const html = `
  <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:24px;color:#2B211B">
    <h2 style="color:#A65234;margin:0 0 12px">Rumah Makan Hulonthalo</h2>
    <p>Halo ${esc(name || "Pelanggan")},</p>
    <p>Terima kasih sudah mendaftar. Klik tombol di bawah untuk memverifikasi email Anda.</p>
    <p style="margin:24px 0"><a href="${esc(link)}" style="background:#A65234;color:#F9F6EE;padding:12px 24px;border-radius:999px;text-decoration:none;font-weight:bold">Verifikasi email</a></p>
    <p style="font-size:12px;color:#777">Jika Anda tidak merasa mendaftar, abaikan email ini.</p>
  </div>`;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to: [to], subject: "Verifikasi email - Rumah Makan Hulonthalo", html }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Resend menolak pengiriman (${res.status}): ${body.slice(0, 200)}`);
  }
}
