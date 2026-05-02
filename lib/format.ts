const myrFormatter = new Intl.NumberFormat("ms-MY", {
  style: "currency",
  currency: "MYR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatMYR(value: number): string {
  if (!Number.isFinite(value)) return "RM 0.00";
  return myrFormatter.format(value).replace(/^RM\s*/, "RM ").replace("MYR", "RM");
}

export function formatGrams(value: number): string {
  if (!Number.isFinite(value)) return "0 g";
  return `${value.toLocaleString("en-MY", { maximumFractionDigits: 4 })} g`;
}
