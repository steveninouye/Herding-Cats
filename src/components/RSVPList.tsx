// src/components/RSVPList.tsx
import { component$ } from "@builder.io/qwik";

interface RSVPListProps {
  confirmed: Array<{ userId: number; displayName: string }>;
  waitlisted: Array<{ userId: number; displayName: string; waitlistPosition: number | null }>;
  maxAttendees: number;
  currentUserId: number;
}

export const RSVPList = component$<RSVPListProps>(
  ({ confirmed, waitlisted, maxAttendees, currentUserId }) => {
    return (
      <div class="space-y-6">
        {/* Confirmed Section */}
        <div>
          <div class="flex items-center gap-2 mb-3">
            <span class="text-green-600 font-bold text-sm">✅ Confirmed</span>
            <span class="text-sm text-slate-400">
              ({confirmed.length}/{maxAttendees})
            </span>
          </div>
          {confirmed.length === 0 ? (
            <p class="text-sm text-slate-400 italic">No RSVPs yet. Be the first!</p>
          ) : (
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {confirmed.map((person) => (
                <div
                  key={person.userId}
                  class={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                    person.userId === currentUserId
                      ? "bg-green-50 border border-green-200 font-semibold text-green-800"
                      : "bg-slate-50 text-slate-700"
                  }`}
                >
                  <span class="w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-orange-400 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {person.displayName.charAt(0).toUpperCase()}
                  </span>
                  <span class="truncate">{person.displayName}</span>
                  {person.userId === currentUserId && (
                    <span class="text-xs text-green-600">(you)</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Waitlist Section */}
        {waitlisted.length > 0 && (
          <div>
            <div class="flex items-center gap-2 mb-3">
              <span class="text-amber-600 font-bold text-sm">⏳ Waitlist</span>
              <span class="text-sm text-slate-400">({waitlisted.length})</span>
            </div>
            <div class="space-y-1.5">
              {waitlisted.map((person) => (
                <div
                  key={person.userId}
                  class={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${
                    person.userId === currentUserId
                      ? "bg-amber-50 border border-amber-200 font-semibold text-amber-800"
                      : "bg-slate-50 text-slate-600"
                  }`}
                >
                  <span class="text-xs font-bold text-amber-500 w-6 text-center">
                    #{person.waitlistPosition}
                  </span>
                  <span class="w-6 h-6 rounded-full bg-slate-300 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {person.displayName.charAt(0).toUpperCase()}
                  </span>
                  <span class="truncate">{person.displayName}</span>
                  {person.userId === currentUserId && (
                    <span class="text-xs text-amber-600">(you)</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }
);
