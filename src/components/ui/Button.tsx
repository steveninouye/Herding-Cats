// src/components/ui/Button.tsx
import { component$, Slot, type QRL } from "@builder.io/qwik";

interface ButtonProps {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  loading?: boolean;
  type?: "button" | "submit";
  class?: string;
  onClick$?: QRL<() => void>;
}

export const Button = component$<ButtonProps>(
  ({
    variant = "primary",
    size = "md",
    disabled = false,
    loading = false,
    type = "button",
    class: className = "",
    onClick$,
  }) => {
    const baseStyles =
      "inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 cursor-pointer border-none";

    const variants: Record<string, string> = {
      primary:
        "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md hover:shadow-lg hover:-translate-y-0.5",
      secondary:
        "bg-white text-amber-600 border-2 border-amber-300 hover:border-amber-500 hover:bg-amber-50",
      danger:
        "bg-red-500 text-white hover:bg-red-600 shadow-md hover:shadow-lg hover:-translate-y-0.5",
      ghost:
        "bg-transparent text-slate-600 hover:bg-slate-100",
    };

    const sizes: Record<string, string> = {
      sm: "px-4 py-2 text-sm",
      md: "px-6 py-3 text-base",
      lg: "px-8 py-4 text-lg",
    };

    return (
      <button
        type={type}
        class={`${baseStyles} ${variants[variant]} ${sizes[size]} ${
          disabled || loading ? "opacity-50 cursor-not-allowed" : ""
        } ${className}`}
        disabled={disabled || loading}
        onClick$={onClick$}
      >
        {loading && (
          <span class="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
        )}
        <Slot />
      </button>
    );
  }
);
