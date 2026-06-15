"use server";

import { revalidatePath } from "next/cache";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { notifications } from "@/db/schema";
import { requireUser } from "@/lib/auth";

export async function markAllNotificationsRead() {
  const user = await requireUser();
  await db
    .update(notifications)
    .set({ readAt: new Date() })
    .where(
      and(
        eq(notifications.profileId, user.id),
        isNull(notifications.readAt)
      )
    );
  revalidatePath("/notifications");
  revalidatePath("/", "layout");
}
