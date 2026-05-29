import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';

const CompareContext = createContext(null);
const MAX_COMPARE = 4;
const STORAGE_KEY = 'compareList';

export function CompareProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const has = useCallback((id) => items.some((m) => m.id === id), [items]);

  const add = useCallback(
    (motorcycle) => {
      setItems((prev) => {
        if (prev.some((m) => m.id === motorcycle.id)) return prev;
        if (prev.length >= MAX_COMPARE) {
          toast.error(`เปรียบเทียบได้สูงสุด ${MAX_COMPARE} คัน`);
          return prev;
        }
        toast.success(`เพิ่ม ${motorcycle.brand} ${motorcycle.model} เข้ารายการเปรียบเทียบ`);
        return [...prev, { id: motorcycle.id, brand: motorcycle.brand, model: motorcycle.model, imageUrl: motorcycle.imageUrl }];
      });
    },
    []
  );

  const remove = useCallback((id) => {
    setItems((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const toggle = useCallback(
    (motorcycle) => {
      if (has(motorcycle.id)) remove(motorcycle.id);
      else add(motorcycle);
    },
    [has, add, remove]
  );

  const clear = useCallback(() => setItems([]), []);

  const replace = useCallback((motorcycles) => {
    const next = motorcycles.slice(0, MAX_COMPARE).map((m) => ({
      id: m.id,
      brand: m.brand,
      model: m.model,
      imageUrl: m.imageUrl,
    }));
    setItems(next);
  }, []);

  return (
    <CompareContext.Provider value={{ items, add, remove, toggle, has, clear, replace, max: MAX_COMPARE }}>
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error('useCompare must be used inside CompareProvider');
  return ctx;
}
