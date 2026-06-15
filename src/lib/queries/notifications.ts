import { and, desc, eq, isNull, sql } from "drizzle-orm";
import { db } from "@/db";
import { notifications } from "@/db/schema";
import type { InferSelectModel } from "drizzle-orm";

export type Notification = InferSelectModel<typeof notifications>;

export async function getNotifications(
  userId: string,
  limit = 50
): Promise<Notification[]> {
  return db
    .select()
    .from(notifications)
    .where(eq(notifications.profileId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(limit);
}

export async function getUnreadNotificationCount(userId: string): Promise<number> {
  const [{ value }] = await db
    .select({ value: sql<number>`count(*)::int` })
    .from(notifications)
    .where(
      and(eq(notifications.profileId, userId), isNull(notifications.readAt))
    );
  return value;
}
