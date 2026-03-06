// src/components/ui/Card.tsx
import { component$, Slot } from "@builder.io/qwik";

interface CardProps {
  class?: string;
  hover?: boolean;
}

export const Card = component$<CardProps>(({ class: className = "", hover = false }) => {
  return (
    <div
      class={`bg-white rounded-2xl shadow-md p-6 border border-slate-100 ${
        hover ? "hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer" : ""
      } ${className}`}
    >
      <Slot />
    </div>
  );
});
