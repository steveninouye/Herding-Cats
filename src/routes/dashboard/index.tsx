// src/routes/dashboard/index.tsx
import { component$ } from "@builder.io/qwik";
import { routeLoader$, type DocumentHead } from "@builder.io/qwik-city";
import { getDb } from "~/db";
import { getSessionUser } from "~/server/auth";
import { getUserGroups } from "~/server/groups";
import { getUpcomingEventsForUser } from "~/server/events";
import { GroupCard } from "~/components/GroupCard";
import { EventCard } from "~/components/EventCard";
import { Card } from "~/components/ui/Card";

export const useDashboardData = routeLoader$(async (requestEvent) => {
  const env = requestEvent.platform.env as { herding_cats_db: D1Database };
  const db = getDb(env.herding_cats_db);
  const user = await getSessionUser(requestEvent);

  if (!user) return { groups: [], events: [], user: null };

  const [groups, events] = await Promise.all([
    getUserGroups(db, user.id),
    getUpcomingEventsForUser(db, user.id),
  ]);

  return { groups, events, user };
});

export default component$(() => {
  const data = useDashboardData();
  const { groups, events, user } = data.value;

  return (
    <div class="max-w-6xl mx-auto px-4 py-8">
      {/* Welcome */}
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-slate-800 m-0">
          Welcome back, <span class="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">{user?.displayName}</span> 👋
        </h1>
        <p class="text-slate-500 mt-2 m-0">Here's what's happening in your communities.</p>
      </div>

      {/* Quick Actions */}
      <div class="flex flex-wrap gap-3 mb-8">
        <a
          href="/groups/new"
          class="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all text-sm no-underline"
        >
          ➕ Create Group
        </a>
        <a
          href="/groups/join"
          class="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-amber-600 font-semibold rounded-xl border-2 border-amber-300 hover:border-amber-500 hover:bg-amber-50 transition-all text-sm no-underline"
        >
          🔗 Join Group
        </a>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upcoming Events */}
        <div class="lg:col-span-2">
          <h2 class="text-xl font-bold text-slate-800 mb-4 m-0">📅 Upcoming Events</h2>
          {events.length === 0 ? (
            <Card>
              <div class="text-center py-8">
                <p class="text-4xl mb-3">🎉</p>
                <p class="text-slate-500 m-0">No upcoming events yet.</p>
                <p class="text-sm text-slate-400 mt-1 m-0">Join a group to see events here!</p>
              </div>
            </Card>
          ) : (
            <div class="space-y-4">
              {events.slice(0, 10).map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </div>

        {/* My Groups */}
        <div>
          <h2 class="text-xl font-bold text-slate-800 mb-4 m-0">🐱 My Groups</h2>
          {groups.length === 0 ? (
            <Card>
              <div class="text-center py-6">
                <p class="text-3xl mb-2">👥</p>
                <p class="text-slate-500 text-sm m-0">No groups yet.</p>
                <a href="/groups/new" class="text-amber-600 text-sm font-medium hover:text-amber-700">
                  Create your first group →
                </a>
              </div>
            </Card>
          ) : (
            <div class="space-y-4">
              {groups.map((group) => (
                <GroupCard key={group.id} group={group} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Dashboard — Herding Cats",
};
