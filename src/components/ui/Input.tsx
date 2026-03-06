// src/components/ui/Input.tsx
import { component$ } from "@builder.io/qwik";

interface InputProps {
  label: string;
  name: string;
  type?: "text" | "email" | "password" | "datetime-local" | "number";
  placeholder?: string;
  required?: boolean;
  error?: string;
  value?: string;
  class?: string;
}

export const Input = component$<InputProps>(
  ({
    label,
    name,
    type = "text",
    placeholder,
    required = false,
    error,
    value,
    class: className = "",
  }) => {
    return (
      <div class={`space-y-1 ${className}`}>
        <label class="block text-sm font-medium text-slate-700" for={name}>
          {label}
          {required && <span class="text-red-400 ml-1">*</span>}
        </label>
        <input
          class={`w-full px-4 py-2.5 border rounded-xl text-slate-800 placeholder-slate-400
            focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all
            ${error ? "border-red-400 focus:ring-red-400" : "border-slate-300"}`}
          id={name}
          name={name}
          type={type}
          placeholder={placeholder}
          required={required}
          value={value}
        />
        {error && <p class="text-red-500 text-sm mt-1">{error}</p>}
      </div>
    );
  }
);
