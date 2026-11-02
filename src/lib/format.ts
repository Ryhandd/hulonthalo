export const rupiah = (n: number) =>
  "Rp" + new Intl.NumberFormat("id-ID").format(n);
