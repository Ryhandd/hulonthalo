import type { Metadata, Viewport } from "next";
import { Playfair_Display, Montserrat } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/store/cart";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import CartBar from "@/components/CartBar";
import ZoomLock from "@/components/ZoomLock";

const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair", display: "swap" });
const montserrat = Montserrat({ subsets: ["latin"], variable: "--font-montserrat", display: "swap" });

export const metadata: Metadata = {
  title: "Rumah Makan Hulonthalo | Kuliner Tradisional Gorontalo",
  description: "Pesan binte biluhuta, tabu moitomo, dan kue tradisional Gorontalo langsung dari ponsel Anda.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#A65234",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${playfair.variable} ${montserrat.variable}`}>
      <body>
        <CartProvider>
          <ZoomLock />
          <Navbar />
          <main className="mx-auto max-w-5xl px-4 pb-28">{children}</main>
          <CartBar />
          <BottomNav />
        </CartProvider>
      </body>
    </html>
  );
}
