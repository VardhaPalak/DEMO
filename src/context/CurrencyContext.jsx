import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";
import { DEFAULT_CURRENCY, formatPrice } from "../lib/format";
const CurrencyContext = createContext(null);
const FALLBACK_SETTINGS = {
  currency: DEFAULT_CURRENCY,
  business: {
    name: "TIMECRAFT",
    whatsapp: "",
    phone: "",
    email: "care@timecraft.com",
    address: "",
    hours: "Mon - Sat, 10:00 - 20:00 IST"
  },
  socials: [],
  paymentMethods: ["Visa", "Mastercard", "Rupay", "UPI", "PayPal"],
  policies: {
    privacy: "/legal/privacy",
    terms: "/legal/terms",
    shipping: "/legal/shipping",
    returns: "/legal/returns"
  }
};
export function CurrencyProvider({ children }) {
  const [settings, setSettings] = useState(FALLBACK_SETTINGS);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    api.get("/settings").then((data) => {
      if (active && data) setSettings({ ...FALLBACK_SETTINGS, ...data });
    }).catch(() => {
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);
  const currency = settings?.currency?.code ? settings.currency : DEFAULT_CURRENCY;
  const format = useCallback(
    (amount) => formatPrice(amount, currency),
    [currency]
  );
  const value = useMemo(
    () => ({ currency, settings, loading, format }),
    [currency, settings, loading, format]
  );
  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}
export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) throw new Error("useCurrency must be used inside CurrencyProvider");
  return context;
}
