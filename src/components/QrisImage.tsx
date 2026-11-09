"use client";

import { useState } from "react";
import QrSim from "./QrSim";

// Menampilkan gambar QRIS asli dari /public/qris.png.
// Jika file belum ada, tampil QR simulasi sebagai cadangan.
export default function QrisImage({ seed }: { seed: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) return <QrSim seed={seed} />;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/qris.png" alt="Kode QRIS Rumah Makan Hulonthalo" width={240} onError={() => setFailed(true)} className="mx-auto h-auto w-60 max-w-full rounded-xl bg-white" />
  );
}
