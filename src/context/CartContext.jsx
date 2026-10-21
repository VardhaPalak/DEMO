import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";
const STORAGE_KEY = "timecraft.cart";
const CartContext = createContext(null);
function readStoredCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
export function CartProvider({ children }) {
  const [items, setItems] = useState(readStoredCart);
  const [isOpen, setIsOpen] = useState(false);
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
    }
  }, [items]);
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);
  const addItem = useCallback((product, quantity = 1) => {
    setItems((current) => {
      const existing = current.find((item) => item.id === product._id);
      if (existing) {
        return current.map(
          (item) => item.id === product._id ? { ...item, quantity: Math.min(item.quantity + quantity, 99) } : item
        );
      }
      return [
        ...current,
        {
          id: product._id,
          name: product.name,
          slug: product.slug,
          price: product.price,
          quantity,
          art: product.art,
          image: product.images?.[0]?.url || ""
        }
      ];
    });
    setIsOpen(true);
  }, []);
  const removeItem = useCallback((id) => {
    setItems((current) => current.filter((item) => item.id !== id));
  }, []);
  const updateQuantity = useCallback((id, quantity) => {
    setItems(
      (current) => current.map((item) => item.id === id ? { ...item, quantity: Math.max(0, Math.min(quantity, 99)) } : item).filter((item) => item.quantity > 0)
    );
  }, []);
  const clear = useCallback(() => setItems([]), []);
  const value = useMemo(
    () => ({
      items,
      count: items.reduce((total, item) => total + item.quantity, 0),
      subtotal: items.reduce((total, item) => total + item.price * item.quantity, 0),
      isOpen,
      addItem,
      removeItem,
      updateQuantity,
      clear,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false)
    }),
    [items, isOpen, addItem, removeItem, updateQuantity, clear]
  );
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
}
