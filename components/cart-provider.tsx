"use client";

import { createContext, useCallback, useContext, useMemo, useSyncExternalStore } from "react";
import type { CartLine } from "@/lib/types";

type CartContextValue = {
  lines: CartLine[];
  count: number;
  add: (line: CartLine) => void;
  setQuantity: (productId: string, optionId: string, quantity: number) => void;
  remove: (productId: string, optionId: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "sweetandsour-cart";
const EMPTY: CartLine[] = [];
const listeners = new Set<() => void>();

let snapshot: CartLine[] = EMPTY;
let snapshotRaw = "[]";

function parseStored(value: string): CartLine[] {
  const parsed = JSON.parse(value) as unknown;
  if (!Array.isArray(parsed)) return EMPTY;
  return parsed.flatMap((line) => {
    if (typeof line !== "object" || line === null) return [];
    const record = line as Record<string, unknown>;
    if (
      typeof record.productId !== "string" ||
      typeof record.optionId !== "string" ||
      typeof record.quantity !== "number"
    ) {
      return [];
    }
    return [
      {
        productId: record.productId,
        optionId: record.optionId,
        quantity: record.quantity,
      },
    ];
  });
}

function readSnapshot() {
  const raw = window.localStorage.getItem(STORAGE_KEY) ?? "[]";
  if (raw === snapshotRaw) return snapshot;
  snapshotRaw = raw;
  try {
    const parsed = parseStored(raw);
    snapshot = parsed.length === 0 ? EMPTY : parsed;
  } catch {
    snapshot = EMPTY;
  }
  return snapshot;
}

function writeSnapshot(lines: CartLine[]) {
  const next = lines.length === 0 ? EMPTY : lines;
  const raw = JSON.stringify(next);
  snapshot = next;
  snapshotRaw = raw;
  window.localStorage.setItem(STORAGE_KEY, raw);
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  function onStorage(event: StorageEvent) {
    if (event.key === STORAGE_KEY) listener();
  }
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const lines = useSyncExternalStore(subscribe, readSnapshot, () => EMPTY);

  const add = useCallback((line: CartLine) => {
    const current = readSnapshot();
    const index = current.findIndex(
      (item) => item.productId === line.productId && item.optionId === line.optionId,
    );
    if (index === -1) {
      writeSnapshot([...current, line]);
      return;
    }
    writeSnapshot(
      current.map((item, itemIndex) =>
        itemIndex === index
          ? { ...item, quantity: Math.min(24, item.quantity + line.quantity) }
          : item,
      ),
    );
  }, []);

  const setQuantity = useCallback((productId: string, optionId: string, quantity: number) => {
    writeSnapshot(
      readSnapshot().flatMap((item) => {
        if (item.productId !== productId || item.optionId !== optionId) return [item];
        if (quantity < 1) return [];
        return [{ ...item, quantity: Math.min(24, quantity) }];
      }),
    );
  }, []);

  const remove = useCallback((productId: string, optionId: string) => {
    writeSnapshot(
      readSnapshot().filter((item) => item.productId !== productId || item.optionId !== optionId),
    );
  }, []);

  const clear = useCallback(() => writeSnapshot(EMPTY), []);
  const count = lines.reduce((sum, line) => sum + line.quantity, 0);
  const value = useMemo(
    () => ({ lines, count, add, setQuantity, remove, clear }),
    [lines, count, add, setQuantity, remove, clear],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const value = useContext(CartContext);
  if (!value) throw new Error("Cart is missing.");
  return value;
}
