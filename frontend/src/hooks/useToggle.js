import { useState, useCallback } from "react";

/**
 * Tiny convenience hook for booleans.
 * const modal = useToggle(false);
 * modal.open();  modal.close();  modal.toggle();
 */
export default function useToggle(initial = false) {
  const [value, setValue] = useState(initial);

  const open   = useCallback(() => setValue(true),  []);
  const close  = useCallback(() => setValue(false), []);
  const toggle = useCallback(() => setValue(v => !v), []);

  // You might occasionally want to set an arbitrary boolean:
  // modal.set(true);
  return { value, set: setValue, open, close, toggle };
}
