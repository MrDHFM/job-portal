"use client";

import { useEffect, type RefObject } from "react";

/**
 * Closes a dropdown/popover/menu when the user:
 *  - clicks or taps anywhere outside the given container ref
 *  - presses Escape
 *
 * Usage:
 *   const ref = useRef<HTMLDivElement>(null);
 *   useClickOutside(ref, isOpen, () => setIsOpen(false));
 *
 * Centralizing this avoids re-implementing the same
 * mousedown/touchstart/keydown listeners in every dropdown.
 */
export function useClickOutside<T extends HTMLElement>(
  ref: RefObject<T | null>,
  active: boolean,
  onClose: () => void,
) {
  useEffect(() => {
    if (!active) return;

    function handlePointerDown(event: MouseEvent | TouchEvent) {
      const target = event.target as Node;

      if (ref.current && !ref.current.contains(target)) {
        onClose();
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    // mousedown (not click) so selecting an option still registers
    // before the outside-click check can race it.
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, onClose]);
}
