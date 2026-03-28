export function formatAmount(raw: string, decimals: number): string {
  if (!raw || raw === "0") return "0";
  const padded = raw.padStart(decimals + 1, "0");
  const intPart = padded.slice(0, padded.length - decimals) || "0";
  const fracPart = padded.slice(padded.length - decimals);
  const trimmed = fracPart.replace(/0+$/, "");
  return trimmed ? `${intPart}.${trimmed}` : intPart;
}

export function toRawAmount(display: string, decimals: number): string {
  if (!display || display === "0") return "0";
  const [intPart, fracPart = ""] = display.split(".");
  const padded = fracPart.padEnd(decimals, "0").slice(0, decimals);
  const raw = (intPart + padded).replace(/^0+/, "") || "0";
  return raw;
}

export function shortenAddress(addr: string, chars = 4): string {
  if (addr.length <= chars * 2 + 3) return addr;
  return `${addr.slice(0, chars)}...${addr.slice(-chars)}`;
}

export function formatUSD(amount: number): string {
  return `$${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
