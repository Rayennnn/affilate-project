import { createSupabaseServer } from "@/lib/supabase/server";
import { products, CREATOR_AVATAR } from "@/data/products";
import type { AffiliateLinkRow } from "@/lib/creator-dashboard";

export type ProfileStats = {
  totalEarned: string;
  totalClicks: string;
  conversions: string;
  activeLinks: string;
};

export type ProfileEarnings = {
  earnedThisMonth: string;
  monthlyGoal: string;
  progress: number;
  pending: string;
  available: string;
};

export type ProfileActivity = {
  id: string;
  type: "earning" | "link" | "traffic";
  title: string;
  subtitle?: string;
  time: string;
};

export type ProfileCompletionItem = {
  label: string;
  done: boolean;
};

export type CreatorProfileData = {
  fullName: string;
  handle: string;
  badge: string;
  bio: string;
  avatarUrl: string;
  memberSince: string;
  instagramUrl?: string;
  tiktokUrl?: string;
  youtubeUrl?: string;
  stats: ProfileStats;
  links: AffiliateLinkRow[];
  earnings: ProfileEarnings;
  topEarner: {
    productName: string;
    brandName: string;
    lifetimeEarn: string;
    image: string;
    shareUrl: string;
  };
  activities: ProfileActivity[];
  completion: {
    percent: number;
    items: ProfileCompletionItem[];
  };
};

// Neutral thumbnails only — the view carries no image column.
const PRODUCT_IMAGES = products.map((p) => p.image);
const MONTHLY_GOAL = 1500;

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatCompact(value: number): string {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  }
  return value.toLocaleString("en-US");
}

function slugHandle(name: string, email?: string): string {
  const fromEmail = email?.split("@")[0]?.replace(/[^a-z0-9]/gi, "") ?? "";
  if (fromEmail) return `@${fromEmail.toLowerCase()}`;
  return `@${name.toLowerCase().replace(/\s+/g, "")}`;
}

function memberSinceDate(dateStr?: string): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return `Member since ${date.toLocaleDateString("en-US", { month: "long", year: "numeric" })}`;
}

function emptyProfile(): CreatorProfileData {
  return {
    fullName: "Creator",
    handle: "@creator",
    badge: "Creator",
    bio: "Complete your profile to tell brands about your content.",
    avatarUrl: CREATOR_AVATAR,
    memberSince: "",
    stats: {
      totalEarned: formatCurrency(0),
      totalClicks: "0",
      conversions: "0",
      activeLinks: "0",
    },
    links: [],
    earnings: {
      earnedThisMonth: formatCurrency(0),
      monthlyGoal: formatCurrency(MONTHLY_GOAL),
      progress: 0,
      pending: formatCurrency(0),
      available: formatCurrency(0),
    },
    topEarner: { productName: "", brandName: "", lifetimeEarn: formatCurrency(0), image: CREATOR_AVATAR, shareUrl: "#" },
    activities: [],
    completion: {
      percent: 0,
      items: [
        { label: "Profile Photo", done: false },
        { label: "Professional Bio", done: false },
        { label: "Connect TikTok", done: false },
        { label: "Verify Identity", done: false },
      ],
    },
  };
}

export async function getCreatorProfileData(): Promise<CreatorProfileData> {
  const empty = emptyProfile();

  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return empty;

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email, avatar_url, created_at")
    .eq("id", user.id)
    .maybeSingle();

  const { data: creator } = await supabase
    .from("creators")
    .select("id, niche, bio, instagram_url, tiktok_url, youtube_url, is_verified, created_at")
    .eq("profile_id", user.id)
    .maybeSingle();

  const fullName = profile?.full_name || "Creator";
  const avatarUrl = profile?.avatar_url ?? CREATOR_AVATAR;
  const bio = creator?.bio || empty.bio;

  let links: AffiliateLinkRow[] = [];
  let stats = empty.stats;
  let earnings = empty.earnings;
  let topEarner = empty.topEarner;
  let activities: ProfileActivity[] = [];

  if (creator) {
    const { data: rows } = await supabase
      .from("creator_dashboard")
      .select("*")
      .eq("creator_id", creator.id)
      .not("ref_code", "is", null);

    const linkRows = (rows ?? []).filter((r) => r.ref_code);

    if (linkRows.length > 0) {
      const totalEarned = linkRows.reduce((s, r) => s + Number(r.total_earned ?? 0), 0);
      const totalClicks = linkRows.reduce((s, r) => s + Number(r.clicks ?? 0), 0);
      const totalConversions = linkRows.reduce(
        (s, r) => s + Number(r.total_conversions ?? 0),
        0,
      );
      const pending = linkRows.reduce((s, r) => s + Number(r.pending_payout ?? 0), 0);
      const available = Math.max(totalEarned - pending, 0);

      stats = {
        totalEarned: formatCurrency(totalEarned),
        totalClicks: formatCompact(totalClicks),
        conversions: totalConversions.toLocaleString("en-US"),
        activeLinks: String(linkRows.length),
      };

      links = linkRows
        .sort((a, b) => Number(b.total_earned ?? 0) - Number(a.total_earned ?? 0))
        .slice(0, 3)
        .map((row, index) => ({
          refCode: row.ref_code,
          fullUrl: row.full_url,
          productName: row.product_name ?? "Product",
          category: row.brand_name ?? "General",
          brandName: row.brand_name ?? "Brand",
          commissionRate: Number(row.commission_rate ?? 0),
          clicks: Number(row.clicks ?? 0),
          earnings: Number(row.total_earned ?? 0),
          image: PRODUCT_IMAGES[index % PRODUCT_IMAGES.length],
        }));

      const best = linkRows.reduce((a, b) =>
        Number(b.total_earned ?? 0) > Number(a.total_earned ?? 0) ? b : a,
      );

      if (Number(best.total_earned ?? 0) > 0) {
        topEarner = {
          productName: best.product_name ?? "Top Product",
          brandName: best.brand_name ?? "Brand",
          lifetimeEarn: formatCurrency(Number(best.total_earned ?? 0)),
          image: PRODUCT_IMAGES[0],
          shareUrl: best.full_url ?? "#",
        };
      }

      earnings = {
        earnedThisMonth: formatCurrency(pending),
        monthlyGoal: formatCurrency(MONTHLY_GOAL),
        progress: Math.min(Math.round((pending / MONTHLY_GOAL) * 100), 100),
        pending: formatCurrency(pending),
        available: formatCurrency(available),
      };
    }

    const { data: recentConversions } = await supabase
      .from("conversions")
      .select("commission_amount, created_at, campaigns(product_name)")
      .eq("creator_id", creator.id)
      .order("created_at", { ascending: false })
      .limit(3);

    if (recentConversions && recentConversions.length > 0) {
      activities = recentConversions.map((c, i) => {
        const campaign = c.campaigns as { product_name?: string } | null;
        const hours = Math.max(1, (Date.now() - new Date(c.created_at).getTime()) / 3600000);
        const time =
          hours < 24
            ? `${Math.round(hours)}h ago`
            : hours < 48
              ? "Yesterday"
              : new Date(c.created_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
        return {
          id: String(i),
          type: "earning" as const,
          title: `You earned ${formatCurrency(Number(c.commission_amount ?? 0))} from ${campaign?.product_name ?? "a sale"}`,
          time,
        };
      });
    }
  }

  const completionItems: ProfileCompletionItem[] = [
    { label: "Profile Photo", done: Boolean(profile?.avatar_url) },
    { label: "Professional Bio", done: Boolean(creator?.bio && creator.bio.length > 20) },
    { label: "Connect TikTok", done: Boolean(creator?.tiktok_url) },
    { label: "Verify Identity", done: Boolean(creator?.is_verified) },
  ];
  const doneCount = completionItems.filter((i) => i.done).length;
  const percent = Math.round((doneCount / completionItems.length) * 100);

  return {
    fullName,
    handle: slugHandle(fullName, profile?.email),
    badge: creator?.is_verified ? "UGC Pro" : "Creator",
    bio,
    avatarUrl,
    memberSince: memberSinceDate(profile?.created_at ?? creator?.created_at),
    instagramUrl: creator?.instagram_url ?? undefined,
    tiktokUrl: creator?.tiktok_url ?? undefined,
    youtubeUrl: creator?.youtube_url ?? undefined,
    stats,
    links,
    earnings,
    topEarner,
    activities,
    completion: { percent, items: completionItems },
  };
}
