"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { notifications } from "@/db/schema";
import { requireUser } from "@/lib/auth";

// Mark a single notification read when the user opens it, then follow its link.
// Scoped to the current user so you can't clear someone else's notification.
export async function markNotificationRead(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  const link = String(formData.get("link") ?? "");

  if (id) {
    await db
      .update(notifications)
      .set({ readAt: new Date() })
      .where(
        and(
          eq(notifications.id, id),
          eq(notifications.profileId, user.id),
          isNull(notifications.readAt)
        )
      );
    revalidatePath("/notifications");
    // SiteHeader lives in the root layout; refresh its unread badge.
    revalidatePath("/", "layout");
  }

  if (link) redirect(link);
}

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
