// src/routes/groups/[groupId]/events/new/index.tsx
import { component$ } from "@builder.io/qwik";
import { routeLoader$, routeAction$, zod$, z, Form, type DocumentHead } from "@builder.io/qwik-city";
import { getDb } from "~/db";
import { getSessionUser } from "~/server/auth";
import { createEvent } from "~/server/events";
import { groups, groupMembers } from "~/db/schema";
import { eq, and } from "drizzle-orm";
import { Card } from "~/components/ui/Card";
import { Input } from "~/components/ui/Input";
import { TextArea } from "~/components/ui/TextArea";
import { Button } from "~/components/ui/Button";

export const useGroupInfo = routeLoader$(async (requestEvent) => {
  const env = requestEvent.platform.env as { herding_cats_db: D1Database };
  const db = getDb(env.herding_cats_db);
  const user = await getSessionUser(requestEvent);

  if (!user) throw requestEvent.redirect(302, "/login");

  const groupId = parseInt(requestEvent.params.groupId, 10);
  if (isNaN(groupId)) throw requestEvent.redirect(302, "/groups");

  // Check ownership/admin
  const membership = await db
    .select({ role: groupMembers.role })
    .from(groupMembers)
    .where(
      and(
        eq(groupMembers.groupId, groupId),
        eq(groupMembers.userId, user.id),
        eq(groupMembers.isBanned, false)
      )
    )
    .get();

  if (!membership || (membership.role !== "owner" && membership.role !== "admin")) {
    throw requestEvent.redirect(302, `/groups/${groupId}`);
  }

  const group = await db
    .select({ id: groups.id, name: groups.name })
    .from(groups)
    .where(eq(groups.id, groupId))
    .get();

  if (!group) throw requestEvent.redirect(302, "/groups");

  return { groupId, groupName: group.name };
});

export const useCreateEvent = routeAction$(
  async (data, requestEvent) => {
    const env = requestEvent.platform.env as { herding_cats_db: D1Database };
    const db = getDb(env.herding_cats_db);
    const user = await getSessionUser(requestEvent);

    if (!user) return { success: false, error: "Not authenticated" };

    const groupId = parseInt(requestEvent.params.groupId, 10);

    // Convert datetime-local to ISO-ish format for SQLite
    const startTime = data.startTime.replace("T", " ") + ":00";
    const endTime = data.endTime ? data.endTime.replace("T", " ") + ":00" : undefined;

    const result = await createEvent(
      db,
      {
        groupId,
        title: data.title,
        description: data.description || undefined,
        locationName: data.locationName,
        startTime,
        endTime,
        maxAttendees: data.maxAttendees ? parseInt(String(data.maxAttendees), 10) : 24,
      },
      user.id
    );

    if (!result.success) {
      return { success: false, error: result.error };
    }

    throw requestEvent.redirect(302, `/events/${result.eventId}`);
  },
  zod$({
    title: z.string().min(2, "Title must be at least 2 characters").max(200),
    description: z.string().max(1000).optional(),
    locationName: z.string().min(1, "Location is required").max(200),
    startTime: z.string().min(1, "Start time is required"),
    endTime: z.string().optional(),
    maxAttendees: z.string().optional(),
  })
);

export default component$(() => {
  const groupInfo = useGroupInfo();
  const createAction = useCreateEvent();

  return (
    <div class="max-w-lg mx-auto px-4 py-8">
      <a
        href={`/groups/${groupInfo.value.groupId}`}
        class="text-sm text-amber-600 hover:text-amber-700 font-medium mb-4 inline-block"
      >
        ← Back to {groupInfo.value.groupName}
      </a>

      <Card>
        <div class="text-center mb-6">
          <span class="text-4xl mb-2 block">📅</span>
          <h1 class="text-2xl font-bold text-slate-800 m-0">Create Event</h1>
          <p class="text-slate-500 text-sm mt-1 m-0">
            for <span class="font-medium text-amber-600">{groupInfo.value.groupName}</span>
          </p>
        </div>

        {createAction.value?.error && (
          <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-4">
            {createAction.value.error}
          </div>
        )}

        <Form action={createAction} class="space-y-4">
          <Input
            label="Event Title"
            name="title"
            placeholder="e.g., Sunday Pickup Game"
            required
            error={createAction.value?.fieldErrors?.title?.[0]}
          />

          <TextArea
            label="Description (optional)"
            name="description"
            placeholder="Any details about the event..."
            rows={3}
          />

          <Input
            label="Location"
            name="locationName"
            placeholder="e.g., Central Park Field 3"
            required
            error={createAction.value?.fieldErrors?.locationName?.[0]}
          />

          <Input
            label="Start Time"
            name="startTime"
            type="datetime-local"
            required
            error={createAction.value?.fieldErrors?.startTime?.[0]}
          />

          <Input
            label="End Time (optional)"
            name="endTime"
            type="datetime-local"
          />

          <Input
            label="Max Attendees"
            name="maxAttendees"
            type="number"
            placeholder="24"
            value="24"
          />

          <Button type="submit" variant="primary" size="lg" class="w-full" loading={createAction.isRunning}>
            Create Event
          </Button>
        </Form>
      </Card>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Create Event — Herding Cats",
};
