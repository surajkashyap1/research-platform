"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { markConversationRead } from "@/app/messages/actions";

// Keeps a conversation thread live: marks incoming messages read on mount and
// refreshes the server component whenever a new message lands (Supabase
// Realtime). Falls back gracefully — if Realtime can't connect, a manual
// refresh still shows new messages.
export function ConversationLive({ conversationId }: { conversationId: string }) {
  const router = useRouter();

  useEffect(() => {
    markConversationRead(conversationId).catch(() => {});

    const supabase = createClient();
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        () => {
          router.refresh();
          markConversationRead(conversationId).catch(() => {});
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, router]);

  return null;
}
