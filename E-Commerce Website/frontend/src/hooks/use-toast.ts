import { useState, useCallback } from "react";

let listeners: any[] = [];
let toasts: any[] = [];
let counter = 0;

function notify() { listeners.forEach(fn => fn([...toasts])); }

export function toast({ title, description, variant = "default" }: { title?: string; description?: string; variant?: "default" | "destructive" }) {
  const id = ++counter;
  toasts = [...toasts, { id, title, description, variant }];
  notify();
  setTimeout(() => { toasts = toasts.filter(t => t.id !== id); notify(); }, 3500);
}

export function useToast() {
  const [ts, setTs] = useState(toasts);
  const sub = useCallback((fn: any) => {
    listeners.push(fn);
    return () => { listeners = listeners.filter(l => l !== fn); };
  }, []);
  useState(() => { const unsub = sub(setTs); return unsub; });
  return { toasts: ts, toast, dismiss: (id: number) => { toasts = toasts.filter(t => t.id !== id); notify(); } };
}
