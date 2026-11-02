// Logo: mangkuk saji + bulir jagung + daun rempah (bentuk geometris dasar)
export default function Logo({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      {/* daun */}
      <path d="M14 22c0-7 5-11 11-11-1 7-5 11-11 11z" fill="#6E7A42" />
      {/* jagung */}
      <ellipse cx="29" cy="15" rx="5" ry="9" fill="#D4A338" />
      <path d="M29 7v16M25.5 12h7M25.5 17h7" stroke="#F9F6EE" strokeWidth="1.2" />
      {/* mangkuk */}
      <path d="M6 25h36c0 9-7 17-18 17S6 34 6 25z" fill="#A65234" />
      <rect x="4" y="23" width="40" height="3.5" rx="1.75" fill="#873F25" />
    </svg>
  );
}
