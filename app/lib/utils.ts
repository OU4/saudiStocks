// lib/utils.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(
  value: number | undefined | null,
  currency?: string,
  compact = false
): string {
  if (value === undefined || value === null || isNaN(value)) {
    return "N/A";
  }

  try {
    if (currency === "%") {
      return `${value.toFixed(2)}%`;
    }

    if (compact) {
      const units = ["", "K", "M", "B", "T"];
      let unitIndex = 0;
      let scaledValue = value;

      while (scaledValue >= 1000 && unitIndex < units.length - 1) {
        scaledValue /= 1000;
        unitIndex += 1;
      }

      return `${currency ? currency + " " : ""}${scaledValue.toFixed(1)}${units[unitIndex]}`;
    }

    if (currency) {
      return `${currency} ${value.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    }

    return value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  } catch (error) {
    // Fallback formatting if Intl is not available
    return `${currency ? currency + " " : ""}${value.toFixed(2)}`;
  }
}