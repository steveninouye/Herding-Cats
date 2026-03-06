// src/routes/groups/index.tsx
import { component$ } from "@builder.io/qwik";
import { routeLoader$, type DocumentHead } from "@builder.io/qwik-city";
import { getDb } from "~/db";
import { getSessionUser } from "~/server/auth";
import { getUserGroups } from "~/server/groups";
import { GroupCard } from "~/components/GroupCard";
import { Card } from "~/components/ui/Card";

export const useGroups = routeLoader$(async (requestEvent) => {
  const env = requestEvent.platform.env as { herding_cats_db: D1Database };
  const db = getDb(env.herding_cats_db);
  const user = await getSessionUser(requestEvent);
  if (!user) return [];
  return getUserGroups(db, user.id);
});

export default component$(() => {
  const groups = useGroups();

  return (
    <div class="max-w-4xl mx-auto px-4 py-8">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-slate-800 m-0">My Groups</h1>
        <div class="flex gap-3">
          <a
            href="/groups/join"
            class="inline-flex items-center gap-2 px-4 py-2 bg-white text-amber-600 font-semibold rounded-xl border-2 border-amber-300 hover:border-amber-500 text-sm no-underline transition-all"
          >
            🔗 Join
          </a>
          <a
            href="/groups/new"
            class="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl shadow-md hover:shadow-lg text-sm no-underline transition-all"
          >
            ➕ Create
          </a>
        </div>
      </div>

      {groups.value.length === 0 ? (
        <Card>
          <div class="text-center py-12">
            <p class="text-5xl mb-4">🐱</p>
            <h3 class="text-lg font-bold text-slate-700 mb-2 m-0">No groups yet</h3>
            <p class="text-slate-500 mb-6 m-0">Create a group or join one with an invite code.</p>
            <div class="flex gap-3 justify-center">
              <a
                href="/groups/new"
                class="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl shadow-md text-sm no-underline"
              >
                Create Group
              </a>
              <a
                href="/groups/join"
                class="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-amber-600 font-semibold rounded-xl border-2 border-amber-300 text-sm no-underline"
              >
                Join Group
              </a>
            </div>
          </div>
        </Card>
      ) : (
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          {groups.value.map((group) => (
            <GroupCard key={group.id} group={group} />
          ))}
        </div>
      )}
    </div>
  );
});

export const head: DocumentHead = {
  title: "My Groups — Herding Cats",
};
