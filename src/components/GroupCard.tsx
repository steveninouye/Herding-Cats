// src/components/GroupCard.tsx
import { component$ } from "@builder.io/qwik";
import { Badge } from "~/components/ui/Badge";

interface GroupCardProps {
  group: {
    id: number;
    name: string;
    description?: string | null;
    memberCount: number;
    role: string;
  };
}

export const GroupCard = component$<GroupCardProps>(({ group }) => {
  return (
    <a href={`/groups/${group.id}`} class="block no-underline">
      <div class="bg-white rounded-2xl shadow-md p-6 border border-slate-100 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">
        <div class="flex items-start justify-between mb-3">
          <h3 class="text-lg font-bold text-slate-800 m-0">{group.name}</h3>
          <Badge variant={group.role === "owner" ? "owner" : group.role === "admin" ? "admin" : "info"}>
            {group.role}
          </Badge>
        </div>
        {group.description && (
          <p class="text-slate-500 text-sm mb-4 line-clamp-2 m-0">{group.description}</p>
        )}
        <div class="flex items-center gap-2 text-sm text-slate-400">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>{group.memberCount} member{group.memberCount !== 1 ? "s" : ""}</span>
        </div>
      </div>
    </a>
  );
});
