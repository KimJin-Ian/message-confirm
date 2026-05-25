"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type NameContextValue = {
  name: string;
  setName: (next: string) => void;
  knownNames: string[];
  addKnownName: (name: string) => void;
};

const NameContext = createContext<NameContextValue | undefined>(undefined);

const STORAGE_KEY = "msgconfirm_author";
const DEFAULT_KNOWN = ["이서진", "김진"];

export function NameProvider({ children }: { children: ReactNode }) {
  const [name, setNameState] = useState<string>("이서진");
  const [knownNames, setKnownNames] = useState<string[]>(DEFAULT_KNOWN);

  // Restore from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setNameState(saved);
        if (saved && !DEFAULT_KNOWN.includes(saved)) {
          setKnownNames((prev) =>
            prev.includes(saved) ? prev : [...prev, saved]
          );
        }
      }
    } catch {
      /* ignore */
    }
  }, []);

  const setName = useCallback((next: string) => {
    setNameState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  }, []);

  const addKnownName = useCallback((newName: string) => {
    if (!newName.trim()) return;
    setKnownNames((prev) =>
      prev.includes(newName.trim()) ? prev : [...prev, newName.trim()]
    );
  }, []);

  const value = useMemo<NameContextValue>(
    () => ({ name, setName, knownNames, addKnownName }),
    [name, setName, knownNames, addKnownName]
  );

  return <NameContext.Provider value={value}>{children}</NameContext.Provider>;
}

export function useAuthor() {
  const ctx = useContext(NameContext);
  if (!ctx) {
    throw new Error("useAuthor must be used inside <NameProvider>");
  }
  return ctx;
}
