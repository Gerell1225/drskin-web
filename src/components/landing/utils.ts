export const PRIMARY = "#D42121";
export const formatMNT = (v: number) => new Intl.NumberFormat("mn-MN").format(v) + "₮";
export const formatDate = (iso: string) =>
  new Date(iso + "T00:00:00").toLocaleDateString("mn-MN", { year: "numeric", month: "2-digit", day: "2-digit" });
export const calcPoints = (price: number) => Math.floor(price / 10000);
