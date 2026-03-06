// src/routes/groups/new/index.tsx
import { component$ } from "@builder.io/qwik";
import { routeAction$, zod$, z, Form, type DocumentHead } from "@builder.io/qwik-city";
import { getDb } from "~/db";
import { getSessionUser } from "~/server/auth";
import { createGroup } from "~/server/groups";
import { Card } from "~/components/ui/Card";
import { Input } from "~/components/ui/Input";
import { TextArea } from "~/components/ui/TextArea";
import { Button } from "~/components/ui/Button";

export const useCreateGroup = routeAction$(
  async (data, requestEvent) => {
    const env = requestEvent.platform.env as { herding_cats_db: D1Database };
    const db = getDb(env.herding_cats_db);
    const user = await getSessionUser(requestEvent);

    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    try {
      const group = await createGroup(
        db,
        { name: data.name, description: data.description || undefined },
        user.id
      );
      throw requestEvent.redirect(302, `/groups/${group.id}`);
    } catch (e) {
      if (e instanceof Response) throw e; // re-throw redirects
      return { success: false, error: "Failed to create group. Please try again." };
    }
  },
  zod$({
    name: z.string().min(2, "Group name must be at least 2 characters").max(100),
    description: z.string().max(500).optional(),
  })
);

export default component$(() => {
  const createAction = useCreateGroup();

  return (
    <div class="max-w-lg mx-auto px-4 py-8">
      <a href="/groups" class="text-sm text-amber-600 hover:text-amber-700 font-medium mb-4 inline-block">
        ← Back to Groups
      </a>

      <Card>
        <div class="text-center mb-6">
          <span class="text-4xl mb-2 block">🐱</span>
          <h1 class="text-2xl font-bold text-slate-800 m-0">Create a Group</h1>
          <p class="text-slate-500 text-sm mt-1 m-0">Start organizing events for your crew.</p>
        </div>

        {createAction.value?.error && (
          <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-4">
            {createAction.value.error}
          </div>
        )}

        <Form action={createAction} class="space-y-4">
          <Input
            label="Group Name"
            name="name"
            placeholder="e.g., Sunday Soccer League"
            required
            error={createAction.value?.fieldErrors?.name?.[0]}
          />

          <TextArea
            label="Description (optional)"
            name="description"
            placeholder="What's this group about?"
            rows={3}
          />

          <Button type="submit" variant="primary" size="lg" class="w-full" loading={createAction.isRunning}>
            Create Group
          </Button>
        </Form>
      </Card>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Create Group — Herding Cats",
};
