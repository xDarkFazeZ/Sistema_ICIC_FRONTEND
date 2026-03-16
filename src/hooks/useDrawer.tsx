import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "icic.drawerOpen";

export default function useDrawer() {
  const [drawerOpen, setDrawerOpen] = useState<boolean>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw === null ? true : raw === "true";
    } catch {
      return true;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, drawerOpen ? "true" : "false");
    } catch {}
  }, [drawerOpen]);

  const toggle = useCallback(() => setDrawerOpen(v => !v), []);

  return { drawerOpen, setDrawerOpen, toggle } as const;
}
