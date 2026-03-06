// src/components/RSVPButton.tsx
import { component$, type QRL } from "@builder.io/qwik";
import { Button } from "~/components/ui/Button";

interface RSVPButtonProps {
  userStatus: string | null;
  waitlistPosition?: number | null;
  isLoading?: boolean;
  onRsvp$: QRL<() => void>;
  onCancel$: QRL<() => void>;
}

export const RSVPButton = component$<RSVPButtonProps>(
  ({ userStatus, waitlistPosition, isLoading = false, onRsvp$, onCancel$ }) => {
    if (userStatus === "confirmed") {
      return (
        <div class="flex flex-col items-center gap-3">
          <div class="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-xl">
            <span class="text-green-600 font-semibold text-sm">✅ You're confirmed!</span>
          </div>
          <Button variant="danger" size="sm" onClick$={onCancel$} loading={isLoading}>
            Cancel RSVP
          </Button>
        </div>
      );
    }

    if (userStatus === "waitlisted") {
      return (
        <div class="flex flex-col items-center gap-3">
          <div class="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-xl">
            <span class="text-amber-600 font-semibold text-sm">
              ⏳ Waitlist #{waitlistPosition}
            </span>
          </div>
          <Button variant="ghost" size="sm" onClick$={onCancel$} loading={isLoading}>
            Leave Waitlist
          </Button>
        </div>
      );
    }

    return (
      <Button variant="primary" size="lg" onClick$={onRsvp$} loading={isLoading}>
        🎉 RSVP Now
      </Button>
    );
  }
);
