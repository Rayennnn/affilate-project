import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";
import { AddProductForm } from "@/components/brand/AddProductForm";

export const metadata: Metadata = {
  title: "Add Product | Creatorly Brand",
};

export default async function AddProductPage() {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h2
          className="text-[32px] font-bold text-[var(--text-primary)]"
          style={{ fontFamily: "var(--font-space-grotesk)" }}
        >
          Add a product
        </h2>
        <p className="mt-1 text-[var(--text-secondary)]">
          Create a campaign so creators can apply and generate affiliate links.
        </p>
      </div>

      <AddProductForm />
    </div>
  );
}
