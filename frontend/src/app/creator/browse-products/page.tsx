import type { Metadata } from "next";
import { BrowseProductsContent } from "@/components/creator/BrowseProductsContent";

export const metadata: Metadata = {
  title: "Browse Products | Creatorly",
  description: "Discover high-commission products for your audience.",
};

export default function BrowseProductsPage() {
  return <BrowseProductsContent />;
}
