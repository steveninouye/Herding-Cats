// src/routes/events/[eventId]/index.tsx
import { component$ } from "@builder.io/qwik";
import {
  routeLoader$,
  routeAction$,
  zod$,
  z,
  Form,
  type DocumentHead,
} from "@builder.io/qwik-city";
import { getDb } from "~/db";
import { getSessionUser } from "~/server/auth";
import { getEventDetail } from "~/server/events";
import { rsvpToEvent, cancelRSVP } from "~/server/rsvps";
import { groups } from "~/db/schema";
import { eq } from "drizzle-orm";
import { Card } from "~/components/ui/Card";
import { Badge } from "~/components/ui/Badge";
import { RSVPList } from "~/components/RSVPList";
import { Button } from "~/components/ui/Button";

export const useEventDetail = routeLoader$(async (requestEvent) => {
  const env = requestEvent.platform.env as { herding_cats_db: D1Database };
  const db = getDb(env.herding_cats_db);
  const user = await getSessionUser(requestEvent);

  if (!user) throw requestEvent.redirect(302, "/login");

  const eventId = parseInt(requestEvent.params.eventId, 10);
  if (isNaN(eventId)) throw requestEvent.redirect(302, "/dashboard");

  const event = await getEventDetail(db, eventId, user.id);
  if (!event) throw requestEvent.redirect(302, "/dashboard");

  // Get group name
  const group = await db
    .select({ name: groups.name })
    .from(groups)
    .where(eq(groups.id, event.groupId))
    .get();

  return {
    event,
    groupName: group?.name ?? "Unknown Group",
    userId: user.id,
  };
});

export const useRsvpAction = routeAction$(
  async (data, requestEvent) => {
    const env = requestEvent.platform.env as { herding_cats_db: D1Database };
    const db = getDb(env.herding_cats_db);
    const user = await getSessionUser(requestEvent);

    if (!user) return { success: false, error: "Not authenticated" };

    const eventId = parseInt(data.eventId, 10);
    const result = await rsvpToEvent(db, eventId, user.id);
    return result;
  },
  zod$({ eventId: z.string() })
);

export const useCancelAction = routeAction$(
  async (data, requestEvent) => {
    const env = requestEvent.platform.env as { herding_cats_db: D1Database };
    const db = getDb(env.herding_cats_db);
    const user = await getSessionUser(requestEvent);

    if (!user) return { success: false, error: "Not authenticated" };

    const eventId = parseInt(data.eventId, 10);
    const result = await cancelRSVP(db, eventId, user.id);
    return result;
  },
  zod$({ eventId: z.string() })
);

export default component$(() => {
  const data = useEventDetail();
  const rsvpAction = useRsvpAction();
  const cancelAction = useCancelAction();
  const { event, groupName, userId } = data.value;

  const date = new Date(event.startTime);
  const dateStr = date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const timeStr = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  let endTimeStr = "";
  if (event.endTime) {
    const endDate = new Date(event.endTime);
    endTimeStr = endDate.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  }

  const spotsLeft = event.maxAttendees - event.confirmedCount;
  const userStatus = event.userRsvp?.status ?? null;
  const waitlistPosition = event.userRsvp?.waitlistPosition ?? null;

  // Check for action results (show feedback)
  const actionError =
    rsvpAction.value?.error || cancelAction.value?.error || null;
  const actionSuccess =
    (rsvpAction.value?.success && rsvpAction.value?.status) ||
    (cancelAction.value?.success ? "cancelled" : null);

  return (
    <div class="max-w-4xl mx-auto px-4 py-8">
      <a
        href={`/groups/${event.groupId}`}
        class="text-sm text-amber-600 hover:text-amber-700 font-medium mb-4 inline-block"
      >
        ← Back to {groupName}
      </a>

      {/* Action Feedback */}
      {actionError && (
        <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-4">
          {actionError}
        </div>
      )}
      {actionSuccess === "confirmed" && (
        <div class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm mb-4">
          ✅ You're confirmed! See you there!
        </div>
      )}
      {actionSuccess === "waitlisted" && (
        <div class="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-xl text-sm mb-4">
          ⏳ You've been added to the waitlist. We'll promote you if a spot opens up!
        </div>
      )}
      {actionSuccess === "cancelled" && (
        <div class="bg-slate-50 border border-slate-200 text-slate-700 px-4 py-3 rounded-xl text-sm mb-4">
          Your RSVP has been cancelled.
          {cancelAction.value?.promoted && (
            <span> {cancelAction.value.promoted} has been promoted from the waitlist! 🎉</span>
          )}
        </div>
      )}

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Event Details */}
        <div class="lg:col-span-2">
          <Card class="mb-6">
            <div class="flex items-start justify-between mb-4">
              <div>
                <p class="text-xs text-amber-600 font-medium mb-1 m-0">{groupName}</p>
                <h1 class="text-2xl font-bold text-slate-800 m-0">{event.title}</h1>
              </div>
              <Badge variant={event.status === "open" ? "confirmed" : "cancelled"}>
                {event.status}
              </Badge>
            </div>

            <div class="space-y-3 mb-6">
              <div class="flex items-center gap-3 text-slate-600">
                <span class="text-lg">📅</span>
                <div>
                  <p class="font-medium m-0">{dateStr}</p>
                  <p class="text-sm text-slate-400 m-0">
                    {timeStr}{endTimeStr ? ` – ${endTimeStr}` : ""}
                  </p>
                </div>
              </div>

              {event.locationName && (
                <div class="flex items-center gap-3 text-slate-600">
                  <span class="text-lg">📍</span>
                  <p class="font-medium m-0">{event.locationName}</p>
                </div>
              )}

              <div class="flex items-center gap-3 text-slate-600">
                <span class="text-lg">👥</span>
                <p class="m-0">
                  <span class="font-medium">{event.confirmedCount}/{event.maxAttendees}</span>
                  <span class="text-slate-400"> confirmed</span>
                  {spotsLeft > 0 && spotsLeft <= 5 && (
                    <span class="text-amber-600 font-medium ml-2">
                      Only {spotsLeft} spot{spotsLeft !== 1 ? "s" : ""} left!
                    </span>
                  )}
                  {spotsLeft === 0 && (
                    <span class="text-red-500 font-medium ml-2">Full — waitlist active</span>
                  )}
                </p>
              </div>
            </div>

            {event.description && (
              <div class="border-t border-slate-100 pt-4">
                <h3 class="text-sm font-semibold text-slate-700 mb-2 m-0">About</h3>
                <p class="text-slate-500 text-sm whitespace-pre-wrap m-0">{event.description}</p>
              </div>
            )}
          </Card>

          {/* RSVP List */}
          <Card>
            <RSVPList
              confirmed={event.confirmed}
              waitlisted={event.waitlisted}
              maxAttendees={event.maxAttendees}
              currentUserId={userId}
            />
          </Card>
        </div>

        {/* RSVP Sidebar */}
        <div>
          <Card>
            <div class="text-center">
              <h3 class="text-lg font-bold text-slate-800 mb-4 m-0">Your RSVP</h3>

              {userStatus === "confirmed" ? (
                <div class="space-y-4">
                  <div class="px-4 py-3 bg-green-50 border border-green-200 rounded-xl">
                    <p class="text-green-700 font-semibold m-0">✅ You're confirmed!</p>
                  </div>
                  <Form action={cancelAction}>
                    <input type="hidden" name="eventId" value={String(event.id)} />
                    <Button
                      type="submit"
                      variant="danger"
                      size="sm"
                      class="w-full"
                      loading={cancelAction.isRunning}
                    >
                      Cancel RSVP
                    </Button>
                  </Form>
                </div>
              ) : userStatus === "waitlisted" ? (
                <div class="space-y-4">
                  <div class="px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl">
                    <p class="text-amber-700 font-semibold m-0">
                      ⏳ Waitlist #{waitlistPosition}
                    </p>
                    <p class="text-xs text-amber-500 mt-1 m-0">
                      You'll be promoted when a spot opens
                    </p>
                  </div>
                  <Form action={cancelAction}>
                    <input type="hidden" name="eventId" value={String(event.id)} />
                    <Button
                      type="submit"
                      variant="ghost"
                      size="sm"
                      class="w-full"
                      loading={cancelAction.isRunning}
                    >
                      Leave Waitlist
                    </Button>
                  </Form>
                </div>
              ) : (
                <div class="space-y-4">
                  <p class="text-slate-500 text-sm m-0">
                    {spotsLeft > 0
                      ? `${spotsLeft} spot${spotsLeft !== 1 ? "s" : ""} available`
                      : "Event is full — you'll be added to the waitlist"}
                  </p>
                  <Form action={rsvpAction}>
                    <input type="hidden" name="eventId" value={String(event.id)} />
                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      class="w-full"
                      loading={rsvpAction.isRunning}
                    >
                      🎉 RSVP Now
                    </Button>
                  </Form>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Event — Herding Cats",
};
