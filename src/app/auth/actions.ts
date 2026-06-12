"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import { createClient } from "@/lib/supabase/server";
import { ensureProfile, requireUser } from "@/lib/auth";
import { computeCompleteness, CAREER_STAGES, type Profile } from "@/lib/profile";

export async function login(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/dashboard");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }
  revalidatePath("/", "layout");
  redirect(next.startsWith("/") ? next : "/dashboard");
}

export async function signup(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const fullName = String(formData.get("fullName") ?? "");

  const supabase = await createClient();
  const origin = (await headers()).get("origin") ?? "";
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: `${origin}/auth/confirm?next=/onboarding`,
    },
  });

  if (error) {
    redirect(`/signup?error=${encodeURIComponent(error.message)}`);
  }

  // If email confirmation is disabled, we get a session immediately.
  if (data.session && data.user) {
    await ensureProfile(data.user);
    revalidatePath("/", "layout");
    redirect("/onboarding");
  }

  // Otherwise the user must click the link in their email.
  redirect("/signup?check=email");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}

const VALID_STAGES = new Set(CAREER_STAGES.map((s) => s.value));

export async function updateProfile(formData: FormData) {
  const user = await requireUser();

  const stageRaw = String(formData.get("careerStage") ?? "other");
  const careerStage = (
    VALID_STAGES.has(stageRaw as Profile["careerStage"]) ? stageRaw : "other"
  ) as Profile["careerStage"];

  const fields = {
    fullName: String(formData.get("fullName") ?? "").trim(),
    university: String(formData.get("university") ?? "").trim() || null,
    specialty: String(formData.get("specialty") ?? "").trim() || null,
    summary: String(formData.get("summary") ?? "").trim() || null,
    availability: String(formData.get("availability") ?? "").trim() || null,
    careerStage,
  };

  const completeness = computeCompleteness(fields as Partial<Profile>);

  await db
    .update(profiles)
    .set({ ...fields, profileCompleteness: completeness, updatedAt: new Date() })
    .where(eq(profiles.id, user.id));

  revalidatePath("/dashboard");
  redirect("/dashboard");
}
