// src/routes/groups/[groupId]/index.tsx
import { component$, useSignal } from "@builder.io/qwik";
import { routeLoader$, type DocumentHead } from "@builder.io/qwik-city";
import { getDb } from "~/db";
import { getSessionUser } from "~/server/auth";
import { getGroupDetail } from "~/server/groups";
import { EventCard } from "~/components/EventCard";
import { Card } from "~/components/ui/Card";
import { Badge } from "~/components/ui/Badge";

export const useGroupDetail = routeLoader$(async (requestEvent) => {
  const env = requestEvent.platform.env as { herding_cats_db: D1Database };
  const db = getDb(env.herding_cats_db);
  const user = await getSessionUser(requestEvent);

  if (!user) {
    throw requestEvent.redirect(302, "/login");
  }

  const groupId = parseInt(requestEvent.params.groupId, 10);
  if (isNaN(groupId)) {
    throw requestEvent.redirect(302, "/groups");
  }

  const group = await getGroupDetail(db, groupId, user.id);
  if (!group) {
    throw requestEvent.redirect(302, "/groups");
  }

  return { group, userId: user.id };
});

export default component$(() => {
  const data = useGroupDetail();
  const { group, userId } = data.value;
  const showInviteCode = useSignal(false);
  const copied = useSignal(false);

  const isOwnerOrAdmin = group.userRole === "owner" || group.userRole === "admin";

  return (
    <div class="max-w-4xl mx-auto px-4 py-8">
      <a href="/groups" class="text-sm text-amber-600 hover:text-amber-700 font-medium mb-4 inline-block">
        ← Back to Groups
      </a>

      {/* Group Header */}
      <Card class="mb-6">
        <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div class="flex items-center gap-3 mb-2">
              <h1 class="text-2xl font-bold text-slate-800 m-0">{group.name}</h1>
              <Badge variant={group.userRole === "owner" ? "owner" : group.userRole === "admin" ? "admin" : "info"}>
                {group.userRole}
              </Badge>
            </div>
            {group.description && (
              <p class="text-slate-500 m-0">{group.description}</p>
            )}
            <p class="text-sm text-slate-400 mt-2 m-0">
              {group.memberCount} member{group.memberCount !== 1 ? "s" : ""}
            </p>
          </div>

          <div class="flex flex-col gap-2">
            {isOwnerOrAdmin && (
              <a
                href={`/groups/${group.id}/events/new`}
                class="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl shadow-md hover:shadow-lg text-sm no-underline transition-all"
              >
                ➕ Create Event
              </a>
            )}
            <button
              class="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white text-slate-600 font-medium rounded-xl border border-slate-200 hover:border-amber-300 text-sm transition-all cursor-pointer"
              onClick$={() => {
                showInviteCode.value = !showInviteCode.value;
              }}
            >
              🔗 {showInviteCode.value ? "Hide" : "Show"} Invite Code
            </button>
          </div>
        </div>

        {showInviteCode.value && (
          <div class="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between">
            <div>
              <p class="text-xs text-amber-600 font-medium mb-1 m-0">Invite Code</p>
              <p class="text-2xl font-bold text-amber-800 tracking-widest m-0">{group.inviteCode}</p>
            </div>
            <button
              class="px-4 py-2 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700 transition-colors cursor-pointer"
              onClick$={() => {
                navigator.clipboard.writeText(group.inviteCode);
                copied.value = true;
                setTimeout(() => { copied.value = false; }, 2000);
              }}
            >
              {copied.value ? "Copied!" : "Copy"}
            </button>
          </div>
        )}
      </Card>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Events */}
        <div class="lg:col-span-2">
          <h2 class="text-lg font-bold text-slate-800 mb-4 m-0">📅 Upcoming Events</h2>
          {group.upcomingEvents.length === 0 ? (
            <Card>
              <div class="text-center py-8">
                <p class="text-3xl mb-2">📅</p>
                <p class="text-slate-500 m-0">No upcoming events.</p>
                {isOwnerOrAdmin && (
                  <a
                    href={`/groups/${group.id}/events/new`}
                    class="text-amber-600 text-sm font-medium hover:text-amber-700 mt-2 inline-block"
                  >
                    Create the first event →
                  </a>
                )}
              </div>
            </Card>
          ) : (
            <div class="space-y-4">
              {group.upcomingEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </div>

        {/* Members */}
        <div>
          <h2 class="text-lg font-bold text-slate-800 mb-4 m-0">👥 Members</h2>
          <Card>
            <div class="space-y-2">
              {group.members.map((member) => (
                <div
                  key={member.userId}
                  class={`flex items-center gap-3 px-3 py-2 rounded-lg ${
                    member.userId === userId ? "bg-amber-50" : ""
                  }`}
                >
                  <span class="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-400 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {(member.groupDisplayName || member.displayName).charAt(0).toUpperCase()}
                  </span>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-slate-700 truncate m-0">
                      {member.groupDisplayName || member.displayName}
                      {member.userId === userId && (
                        <span class="text-xs text-amber-600 ml-1">(you)</span>
                      )}
                    </p>
                  </div>
                  {member.role !== "member" && (
                    <Badge variant={member.role === "owner" ? "owner" : "admin"}>
                      {member.role}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Group — Herding Cats",
};
