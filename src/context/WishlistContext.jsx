import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
const STORAGE_KEY = "timecraft.wishlist";
const WishlistContext = createContext(null);
function readStored() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}
export function WishlistProvider({ children }) {
  const [ids, setIds] = useState(readStored);
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    } catch {
    }
  }, [ids]);
  const has = useCallback((id) => ids.includes(id), [ids]);
  const toggle = useCallback((id) => {
    setIds(
      (current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  }, []);
  const remove = useCallback((id) => {
    setIds((current) => current.filter((item) => item !== id));
  }, []);
  const value = useMemo(
    () => ({ ids, count: ids.length, has, toggle, remove, clear: () => setIds([]) }),
    [ids, has, toggle, remove]
  );
  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}
export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) throw new Error("useWishlist must be used inside WishlistProvider");
  return context;
}
