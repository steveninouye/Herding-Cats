// src/components/ui/Badge.tsx
import { component$, Slot } from "@builder.io/qwik";

interface BadgeProps {
  variant?: "confirmed" | "waitlist" | "cancelled" | "info" | "owner" | "admin";
  class?: string;
}

export const Badge = component$<BadgeProps>(({ variant = "info", class: className = "" }) => {
  const variants: Record<string, string> = {
    confirmed: "bg-green-100 text-green-800",
    waitlist: "bg-amber-100 text-amber-800",
    cancelled: "bg-red-100 text-red-800",
    info: "bg-slate-100 text-slate-700",
    owner: "bg-purple-100 text-purple-800",
    admin: "bg-blue-100 text-blue-800",
  };

  return (
    <span
      class={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${variants[variant]} ${className}`}
    >
      <Slot />
    </span>
  );
});
