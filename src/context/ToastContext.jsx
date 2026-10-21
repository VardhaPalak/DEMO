import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import Icon from "../components/ui/Icon";
const ToastContext = createContext(null);
const TONE_ICON = {
  success: "check",
  error: "close",
  info: "sparkle"
};
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const counter = useRef(0);
  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);
  const push = useCallback(
    (message, tone = "success") => {
      counter.current += 1;
      const id = counter.current;
      setToasts((current) => [...current, { id, message, tone }]);
      window.setTimeout(() => dismiss(id), 4200);
    },
    [dismiss]
  );
  const value = useMemo(() => ({ push }), [push]);
  return <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-24 left-1/2 z-[90] flex w-[min(92vw,420px)] -translate-x-1/2 flex-col gap-2 sm:left-auto sm:right-6 sm:translate-x-0">
        {toasts.map((toast) => <div
    key={toast.id}
    className={`pointer-events-auto flex items-start gap-3 border px-4 py-3 text-sm shadow-luxe backdrop-blur animate-fade-up ${toast.tone === "error" ? "border-red-500/40 bg-[#1a1010]/95 text-red-100" : "border-gold/40 bg-charcoal/95 text-warm-white"}`}
  >
            <Icon
    name={TONE_ICON[toast.tone]}
    size={16}
    className={`mt-0.5 shrink-0 ${toast.tone === "error" ? "text-red-300" : "text-gold"}`}
  />
            <p className="flex-1 leading-relaxed">{toast.message}</p>
            <button
    type="button"
    onClick={() => dismiss(toast.id)}
    className="text-ash transition hover:text-white"
    aria-label="Dismiss notification"
  >
              <Icon name="close" size={14} />
            </button>
          </div>)}
      </div>
    </ToastContext.Provider>;
}
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used inside ToastProvider");
  return context;
}
