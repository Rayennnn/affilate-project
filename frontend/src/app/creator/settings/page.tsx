import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";
import { getOrCreateCreatorId } from "@/lib/creator";
import { SettingsForm } from "@/components/creator/SettingsForm";

export const metadata: Metadata = {
  title: "Settings | Creatorly",
};

export default async function SettingsPage() {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const creatorId = await getOrCreateCreatorId(supabase, user.id);

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email")
    .eq("id", user.id)
    .maybeSingle();

  let iban = "";
  if (creatorId) {
    const { data: creator } = await supabase
      .from("creators")
      .select("iban")
      .eq("id", creatorId)
      .maybeSingle();
    iban = creator?.iban ?? "";
  }

  return (
    <SettingsForm
      initial={{
        fullName: profile?.full_name ?? "",
        email: profile?.email ?? user.email ?? "",
        iban,
      }}
    />
  );
}
