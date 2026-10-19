"use client";

// Küldőgomb, ami mentés közben jelzi, hogy dolgozik (useFormStatus).
// Ez az egyetlen oka, hogy kliens komponens: az űrlap enélkül is működik.
import { useFormStatus } from "react-dom";
import { buttonClass } from "./ui";

export default function SubmitButton({ variant = "primary", className = "", pendingText = "Mentés…", children, ...props }) {
  const { pending } = useFormStatus();
  return (
    <button {...props} disabled={pending || props.disabled} className={buttonClass(variant, className)}>
      {pending ? pendingText : children}
    </button>
  );
}
