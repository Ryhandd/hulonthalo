// Simulasi QR code QRIS (bukan QR asli): pola deterministik dari seed, lengkap dengan 3 penanda sudut.
const N = 29;

function rng(seed: string) {
  let h = 2166136261;
  for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return () => {
    h ^= h << 13; h ^= h >>> 17; h ^= h << 5;
    return ((h >>> 0) % 1000) / 1000;
  };
}

export default function QrSim({ seed, size = 192 }: { seed: string; size?: number }) {
  const r = rng(seed);
  const finder = (x: number, y: number) =>
    (x < 7 && y < 7) || (x >= N - 7 && y < 7) || (x < 7 && y >= N - 7);
  const cells: React.ReactNode[] = [];
  for (let y = 0; y < N; y++)
    for (let x = 0; x < N; x++) {
      if (finder(x, y)) continue;
      if (r() > 0.52) cells.push(<rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" />);
    }
  const eye = (x: number, y: number) => (
    <g key={`e${x}${y}`}>
      <rect x={x} y={y} width="7" height="7" />
      <rect x={x + 1} y={y + 1} width="5" height="5" fill="#fff" />
      <rect x={x + 2} y={y + 2} width="3" height="3" />
    </g>
  );
  return (
    <svg width={size} height={size} viewBox={`-2 -2 ${N + 4} ${N + 4}`} role="img" aria-label="Simulasi kode QR QRIS" shapeRendering="crispEdges" className="rounded-xl bg-white" fill="#2B211B">
      <rect x="-2" y="-2" width={N + 4} height={N + 4} fill="#fff" />
      {cells}
      {eye(0, 0)}{eye(N - 7, 0)}{eye(0, N - 7)}
    </svg>
  );
}
