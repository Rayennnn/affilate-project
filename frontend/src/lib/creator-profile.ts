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

const PRODUCT_IMAGES = products.map((p) => p.image);

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
  if (!dateStr) return "Member since March 2024";
  const date = new Date(dateStr);
  return `Member since ${date.toLocaleDateString("en-US", { month: "long", year: "numeric" })}`;
}

export function getDemoProfileData(): CreatorProfileData {
  return {
    fullName: "Alex Rivera",
    handle: "@alexcreates",
    badge: "UGC Pro",
    bio: "UGC Creator & Tech Enthusiast. Helping brands tell their story through authentic content. Specialized in high-performance tech gadgets and lifestyle products.",
    avatarUrl: CREATOR_AVATAR,
    memberSince: "Member since March 2024",
    instagramUrl: "https://instagram.com",
    tiktokUrl: "https://tiktok.com",
    youtubeUrl: "https://youtube.com",
    stats: {
      totalEarned: "$4,250.00",
      totalClicks: "12.4k",
      conversions: "342",
      activeLinks: "18",
    },
    links: [
      {
        refCode: "ultra1",
        fullUrl: "https://shop.converty.shop/p/ultrapod?ref=ultra1",
        productName: "UltraPod Pro",
        category: "Tech Accessories",
        brandName: "LumeTech",
        commissionRate: 15,
        clicks: 1240,
        earnings: 842,
        image: PRODUCT_IMAGES[0],
      },
      {
        refCode: "vlog2",
        fullUrl: "https://shop.converty.shop/p/vlog?ref=vlog2",
        productName: "Vlog Kit XL",
        category: "Camera Gear",
        brandName: "OpticPro",
        commissionRate: 12,
        clicks: 942,
        earnings: 512.4,
        image: PRODUCT_IMAGES[2],
      },
      {
        refCode: "aura3",
        fullUrl: "https://shop.converty.shop/p/aura?ref=aura3",
        productName: "Aura Glow Panel",
        category: "Lighting",
        brandName: "LumiaSet",
        commissionRate: 20,
        clicks: 2105,
        earnings: 1102.5,
        image: PRODUCT_IMAGES[4],
      },
    ],
    earnings: {
      earnedThisMonth: "$1,240.00",
      monthlyGoal: "$1,500",
      progress: 82,
      pending: "$245.00",
      available: "$995.00",
    },
    topEarner: {
      productName: "UltraPod Pro",
      brandName: "LumeTech",
      lifetimeEarn: "$2,145.00",
      image: PRODUCT_IMAGES[0],
      shareUrl: "https://shop.converty.shop/p/ultrapod?ref=ultra1",
    },
    activities: [
      {
        id: "1",
        type: "earning",
        title: "You earned $12.00 from Glossier",
        time: "2h ago",
      },
      {
        id: "2",
        type: "link",
        title: "Affiliate Link Created",
        subtitle: "Luma Serum",
        time: "5h ago",
      },
      {
        id: "3",
        type: "traffic",
        title: "Traffic Spike Detected",
        subtitle: "UltraPod Pro",
        time: "Yesterday",
      },
    ],
    completion: {
      percent: 85,
      items: [
        { label: "Profile Photo", done: true },
        { label: "Professional Bio", done: true },
        { label: "Connect TikTok", done: true },
        { label: "Verify Identity", done: false },
      ],
    },
  };
}

export async function getCreatorProfileData(): Promise<CreatorProfileData> {
  const demo = getDemoProfileData();

  try {
    const supabase = await createSupabaseServer();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return demo;

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

    const fullName = profile?.full_name ?? demo.fullName;
    const avatarUrl = profile?.avatar_url ?? CREATOR_AVATAR;
    const bio =
      creator?.bio ??
      "UGC Creator passionate about authentic brand storytelling and high-converting affiliate content.";

    let links: AffiliateLinkRow[] = demo.links;
    let stats = demo.stats;
    let earnings = demo.earnings;
    let topEarner = demo.topEarner;
    let activities = demo.activities;

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

        topEarner = {
          productName: best.product_name ?? "Top Product",
          brandName: best.brand_name ?? "Brand",
          lifetimeEarn: formatCurrency(Number(best.total_earned ?? 0)),
          image: PRODUCT_IMAGES[0],
          shareUrl: best.full_url ?? demo.topEarner.shareUrl,
        };

        const goal = 1500;
        const monthEarned = pending + available * 0.3;
        earnings = {
          earnedThisMonth: formatCurrency(monthEarned || pending || available),
          monthlyGoal: formatCurrency(goal),
          progress: Math.min(Math.round(((monthEarned || pending) / goal) * 100), 100),
          pending: formatCurrency(pending),
          available: formatCurrency(available),
        };

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
      instagramUrl: creator?.instagram_url ?? demo.instagramUrl,
      tiktokUrl: creator?.tiktok_url ?? demo.tiktokUrl,
      youtubeUrl: creator?.youtube_url ?? demo.youtubeUrl,
      stats,
      links,
      earnings,
      topEarner,
      activities,
      completion: { percent, items: completionItems },
    };
  } catch {
    return demo;
  }
}
