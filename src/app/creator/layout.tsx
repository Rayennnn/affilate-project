import { CreatorSidebar } from "@/components/creator/CreatorSidebar";
import { CreatorHeader } from "@/components/creator/CreatorHeader";

export default function CreatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dashboard-scrollbar min-h-screen bg-[var(--bg-primary)] text-[var(--text-on-surface)]">
      <CreatorSidebar />
      <CreatorHeader />
      <main className="mx-auto ml-[240px] mt-16 min-h-screen max-w-[1280px] p-6">
        {children}
      </main>
    </div>
  );
}
