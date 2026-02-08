import { getDb } from "./index";
import { users } from "./schema";
import { hashPassword } from "../lib/password";
import { eq } from "drizzle-orm";

/**
 * Seed the first platform admin.
 * Run via: npx wrangler d1 execute herding-cats-db --local --command "..."
 * OR use the script approach below.
 */
export async function seed(d1: D1Database) {
    const db = getDb(d1);

    const email = "hiiamsteveni@gmail.com";

    // Default password — CHANGE THIS after first login
    const defaultPassword = "HerdingCats2024!";
    const passwordHashed = await hashPassword(defaultPassword);

    const existing = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .get();

    if (existing) {
        console.log("⚠️  Admin user already exists, skipping seed.");
        return;
    }

    await db.insert(users).values({
        email,
        displayName: "Steve",
        passwordHash: passwordHashed,
        inviteStatus: "accepted",
        isActive: true,
        isPlatformAdmin: true,
        socialScore: 100.0,
    });

    console.log("✅ Platform admin seeded successfully");
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${defaultPassword}`);
    console.log("   ⚠️  Change this password after first login!");
}