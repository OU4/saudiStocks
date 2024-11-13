// lib/utils.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(
  value: number,
  currency?: string,
  compact = false
): string {
  if (typeof value !== "number" || isNaN(value)) {
    return "N/A";
  }

  const formatter = new Intl.NumberFormat("en-US", {
    style: currency ? "currency" : "decimal",
    currency: currency === "SAR" ? "SAR" : undefined,
    notation: compact ? "compact" : "standard",
    maximumFractionDigits: 2,
  });

  const formattedValue = formatter.format(value);

  if (currency === "%") {
    return `${formattedValue}%`;
  }

  return formattedValue;
}