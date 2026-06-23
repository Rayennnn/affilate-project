import { CREATOR_AVATAR } from "@/data/products";

export type EditProfileInitialData = {
  displayName: string;
  username: string;
  bio: string;
  avatarUrl: string;
  email: string;
  instagramUrl: string;
  tiktokUrl: string;
  youtubeUrl: string;
  twitterUrl: string;
  categories: string[];
  ageGroup: string;
  location: string;
  monthlyReach: string;
  audienceSize: number;
  profileStrength: number;
  twoFactorEnabled: boolean;
  paypalEmail: string;
  bankConnected: boolean;
};

export const CATEGORY_OPTIONS = [
  "Beauty",
  "Tech",
  "Fashion",
  "Lifestyle",
  "Gaming",
  "Education",
  "Finance",
  "Fitness",
] as const;

export const AGE_GROUPS = ["18-24", "25-34", "35-44", "45-54", "55+"] as const;
export const LOCATIONS = [
  "United States",
  "United Kingdom",
  "France",
  "Canada",
  "Germany",
  "Tunisia",
] as const;
export const MONTHLY_REACH = ["10k-25k", "25k-50k", "50k-100k", "100k-250k", "250k+"] as const;

function slugUsername(name: string, email?: string): string {
  const base = email?.split("@")[0]?.replace(/[^a-z0-9_]/gi, "_").toLowerCase() ?? name.toLowerCase().replace(/\s+/g, "_");
  return `@${base}`;
}

function reachFromAudience(size: number): string {
  if (size >= 250000) return "250k+";
  if (size >= 100000) return "100k-250k";
  if (size >= 50000) return "50k-100k";
  if (size >= 25000) return "25k-50k";
  return "10k-25k";
}

function audienceFromReach(reach: string): number {
  const map: Record<string, number> = {
    "10k-25k": 15000,
    "25k-50k": 37500,
    "50k-100k": 75000,
    "100k-250k": 175000,
    "250k+": 300000,
  };
  return map[reach] ?? 75000;
}

function nicheToCategories(niche?: string | null): string[] {
  if (!niche) return ["Beauty", "Tech"];
  return niche
    .split(",")
    .map((n) => n.trim())
    .filter(Boolean)
    .map((n) => n.charAt(0).toUpperCase() + n.slice(1).toLowerCase())
    .filter((n) => CATEGORY_OPTIONS.includes(n as (typeof CATEGORY_OPTIONS)[number]));
}

export function getDemoEditProfileData(): EditProfileInitialData {
  return {
    displayName: "Alex Creative",
    username: "@alex_creative",
    bio: "Professional UGC creator specializing in tech reviews and lifestyle content. Partnering with top brands to create high-converting content.",
    avatarUrl: CREATOR_AVATAR,
    email: "alex.creative@example.com",
    instagramUrl: "https://instagram.com/alex_creative",
    tiktokUrl: "",
    youtubeUrl: "",
    twitterUrl: "",
    categories: ["Beauty", "Tech"],
    ageGroup: "25-34",
    location: "United States",
    monthlyReach: "50k-100k",
    audienceSize: 75000,
    profileStrength: 85,
    twoFactorEnabled: true,
    paypalEmail: "alex.creative@example.com",
    bankConnected: true,
  };
}

export { audienceFromReach, slugUsername, reachFromAudience, nicheToCategories };
