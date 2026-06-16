import { format, parseISO, type Locale } from "date-fns";
import { enUS, zhCN } from "date-fns/locale";
import i18n from "@/lib/i18n";

const dateLocales: Record<string, Locale> = { en: enUS, zh: zhCN };

function currentDateLocale(): Locale {
  const lang = (i18n.language || "en").split("-")[0];
  return dateLocales[lang] ?? enUS;
}

/** Locale-aware currency formatting via Intl, with a safe fallback. */
export function formatCurrency(amount: number, currency?: string | null): string {
  const code = (currency ?? "USD").toUpperCase();
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency: code }).format(amount);
  } catch {
    return `${code} ${amount.toFixed(2)}`;
  }
}

/** Integer currency (no decimals) — for aggregate totals. */
export function formatCurrencyShort(amount: number, currency?: string | null): string {
  const code = (currency ?? "USD").toUpperCase();
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: code,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${code} ${Math.round(amount)}`;
  }
}

/** Locale-aware date formatting. Accepts a `yyyy-MM-dd` or full ISO string. */
export function formatDate(dateStr: string, fmt = "MMM d, yyyy"): string {
  const iso = dateStr.length === 10 ? `${dateStr}T00:00:00` : dateStr;
  return format(parseISO(iso), fmt, { locale: currentDateLocale() });
}
