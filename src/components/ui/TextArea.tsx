// src/components/ui/TextArea.tsx
import { component$ } from "@builder.io/qwik";

interface TextAreaProps {
  label: string;
  name: string;
  placeholder?: string;
  rows?: number;
  value?: string;
  class?: string;
}

export const TextArea = component$<TextAreaProps>(
  ({ label, name, placeholder, rows = 3, value, class: className = "" }) => {
    return (
      <div class={`space-y-1 ${className}`}>
        <label class="block text-sm font-medium text-slate-700" for={name}>
          {label}
        </label>
        <textarea
          class="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-slate-800 placeholder-slate-400
            focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all resize-vertical"
          id={name}
          name={name}
          placeholder={placeholder}
          rows={rows}
          value={value}
        />
      </div>
    );
  }
);
