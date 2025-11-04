import { useEffect } from "react";

/**
 * Close a dropdown / modal when the user clicks outside the passed ref.
 * Example:
 * const ref = useRef();
 * useOutsideClick(ref, () => setIsOpen(false));
 */
export default function useOutsideClick(ref, onOutsideClick, enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    const handle = (e) => {
      // Ignore if clicking inside the element or the ref is not mounted yet.
      if (!ref.current || ref.current.contains(e.target)) return;
      onOutsideClick(e);
    };

    document.addEventListener("mousedown", handle);
    document.addEventListener("touchstart", handle);
    return () => {
      document.removeEventListener("mousedown", handle);
      document.removeEventListener("touchstart", handle);
    };
  }, [ref, onOutsideClick, enabled]);
}
