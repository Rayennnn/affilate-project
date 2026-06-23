import Image from "next/image";
import { Share2 } from "lucide-react";

type TopEarnerProps = {
  productName: string;
  brandName: string;
  lifetimeEarn: string;
  image: string;
  shareUrl: string;
};

export function ProfileTopEarner({ topEarner }: { topEarner: TopEarnerProps }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-[var(--border-outline)] bg-[var(--bg-card)]">
      <div className="relative h-36 w-full">
        <Image
          src={topEarner.image}
          alt={topEarner.productName}
          fill
          className="object-cover opacity-60"
          sizes="380px"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-card)] via-[var(--bg-card)]/60 to-transparent" />
      </div>

      <div className="relative -mt-16 p-6 pt-0">
        <span className="inline-flex rounded-md bg-[var(--accent-lime-bg)] px-2.5 py-1 text-[10px] font-bold tracking-wider text-[var(--accent-lime-bright)] uppercase">
          Top Earner
        </span>
        <p className="mt-3 text-lg font-bold text-[var(--text-primary)]">
          {topEarner.productName}
        </p>
        <p className="text-sm text-[var(--text-secondary)]">by {topEarner.brandName}</p>
        <div className="mt-4 flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold tracking-wider text-[var(--text-secondary)] uppercase">
              Lifetime Earn
            </p>
            <p
              className="text-2xl font-bold text-[var(--accent-lime-bright)]"
              style={{ fontFamily: "var(--font-space-grotesk)" }}
            >
              {topEarner.lifetimeEarn}
            </p>
          </div>
          <a
            href={topEarner.shareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-[var(--border-outline)] px-4 py-2 text-sm font-medium text-[var(--text-on-surface)] transition-colors hover:bg-[var(--bg-hover)]"
          >
            <Share2 className="h-4 w-4" />
            Share Link
          </a>
        </div>
      </div>
    </div>
  );
}
