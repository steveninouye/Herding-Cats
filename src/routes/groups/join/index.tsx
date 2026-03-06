// src/routes/groups/join/index.tsx
import { component$ } from "@builder.io/qwik";
import { routeAction$, zod$, z, Form, type DocumentHead } from "@builder.io/qwik-city";
import { getDb } from "~/db";
import { getSessionUser } from "~/server/auth";
import { joinGroupByCode } from "~/server/groups";
import { Card } from "~/components/ui/Card";
import { Input } from "~/components/ui/Input";
import { Button } from "~/components/ui/Button";

export const useJoinGroup = routeAction$(
  async (data, requestEvent) => {
    const env = requestEvent.platform.env as { herding_cats_db: D1Database };
    const db = getDb(env.herding_cats_db);
    const user = await getSessionUser(requestEvent);

    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    const result = await joinGroupByCode(db, data.inviteCode, user.id);

    if (!result.success) {
      return { success: false, error: result.error };
    }

    throw requestEvent.redirect(302, `/groups/${result.groupId}`);
  },
  zod$({
    inviteCode: z.string().min(1, "Please enter an invite code").max(10),
  })
);

export default component$(() => {
  const joinAction = useJoinGroup();

  return (
    <div class="max-w-lg mx-auto px-4 py-8">
      <a href="/groups" class="text-sm text-amber-600 hover:text-amber-700 font-medium mb-4 inline-block">
        ← Back to Groups
      </a>

      <Card>
        <div class="text-center mb-6">
          <span class="text-4xl mb-2 block">🔗</span>
          <h1 class="text-2xl font-bold text-slate-800 m-0">Join a Group</h1>
          <p class="text-slate-500 text-sm mt-1 m-0">Enter the invite code shared by a group member.</p>
        </div>

        {joinAction.value?.error && (
          <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-4">
            {joinAction.value.error}
          </div>
        )}

        <Form action={joinAction} class="space-y-4">
          <Input
            label="Invite Code"
            name="inviteCode"
            placeholder="e.g., ABC123"
            required
            error={joinAction.value?.fieldErrors?.inviteCode?.[0]}
          />

          <Button type="submit" variant="primary" size="lg" class="w-full" loading={joinAction.isRunning}>
            Join Group
          </Button>
        </Form>
      </Card>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Join Group — Herding Cats",
};
