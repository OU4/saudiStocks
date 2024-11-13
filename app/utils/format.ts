// lib/utils/format.ts
export const formatCurrency = (value: number | null | undefined, compact = false): string => {
  if (value === null || value === undefined) return 'N/A';

  try {
    if (compact) {
      if (Math.abs(value) >= 1e12) {
        return `SAR ${(value / 1e12).toFixed(2)}T`;
      }
      if (Math.abs(value) >= 1e9) {
        return `SAR ${(value / 1e9).toFixed(2)}B`;
      }
      if (Math.abs(value) >= 1e6) {
        return `SAR ${(value / 1e6).toFixed(2)}M`;
      }
      if (Math.abs(value) >= 1e3) {
        return `SAR ${(value / 1e3).toFixed(2)}K`;
      }
    }

    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  } catch (error) {
    return `SAR ${value.toFixed(2)}`;
  }
};

export const formatNumber = (value: number | null | undefined, decimals = 2): string => {
  if (value === null || value === undefined) return 'N/A';
  // return value.toFixed(decimals);
};

export const formatPercent = (value: number | null | undefined, decimals = 2): string => {
  if (value === null || value === undefined) return 'N/A';
  return `${value.toFixed(decimals)}%`;
};

export const formatCompactNumber = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return 'N/A';

  if (Math.abs(value) >= 1e9) {
    return `${(value / 1e9).toFixed(2)}B`;
  }
  if (Math.abs(value) >= 1e6) {
    return `${(value / 1e6).toFixed(2)}M`;
  }
  if (Math.abs(value) >= 1e3) {
    return `${(value / 1e3).toFixed(2)}K`;
  }
  return value.toLocaleString();
};

export const formatChange = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return 'N/A';
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
};