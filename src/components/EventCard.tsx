// src/components/EventCard.tsx
import { component$ } from "@builder.io/qwik";
import { Badge } from "~/components/ui/Badge";

interface EventCardProps {
  event: {
    id: number;
    title: string;
    startTime: string;
    locationName?: string | null;
    confirmedCount: number;
    maxAttendees: number;
    userStatus?: string | null;
    waitlistPosition?: number | null;
  };
  showGroupName?: string;
}

export const EventCard = component$<EventCardProps>(({ event, showGroupName }) => {
  const date = new Date(event.startTime);
  const dateStr = date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const timeStr = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  const spotsLeft = event.maxAttendees - event.confirmedCount;

  return (
    <a href={`/events/${event.id}`} class="block no-underline">
      <div class="bg-white rounded-2xl shadow-md p-5 border border-slate-100 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">
        <div class="flex items-start justify-between mb-2">
          <h4 class="text-base font-bold text-slate-800 m-0">{event.title}</h4>
          {event.userStatus === "confirmed" && (
            <Badge variant="confirmed">✅ Confirmed</Badge>
          )}
          {event.userStatus === "waitlisted" && (
            <Badge variant="waitlist">⏳ #{event.waitlistPosition}</Badge>
          )}
        </div>

        {showGroupName && (
          <p class="text-xs text-amber-600 font-medium mb-2 m-0">{showGroupName}</p>
        )}

        <div class="space-y-1.5 text-sm text-slate-500">
          <div class="flex items-center gap-2">
            <span>📅</span>
            <span>{dateStr} at {timeStr}</span>
          </div>
          {event.locationName && (
            <div class="flex items-center gap-2">
              <span>📍</span>
              <span>{event.locationName}</span>
            </div>
          )}
          <div class="flex items-center gap-2">
            <span>👥</span>
            <span class={spotsLeft <= 3 && spotsLeft > 0 ? "text-amber-600 font-medium" : spotsLeft === 0 ? "text-red-500 font-medium" : ""}>
              {event.confirmedCount}/{event.maxAttendees} confirmed
              {spotsLeft > 0 ? ` · ${spotsLeft} spot${spotsLeft !== 1 ? "s" : ""} left` : " · Full"}
            </span>
          </div>
        </div>
      </div>
    </a>
  );
});
