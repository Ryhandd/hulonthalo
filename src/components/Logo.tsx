import Image from "next/image";

// Logo asli UMKM Hulonthalo (public/logo.png)
export default function Logo({ size = 36 }: { size?: number }) {
  return (
    <Image
      src="/logo.png"
      alt="Logo Rumah Makan Hulonthalo"
      width={size}
      height={size}
      priority
      draggable={false}
      style={{ width: size, height: size, objectFit: "contain" }}
    />
  );
}
