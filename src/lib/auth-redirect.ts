export type UserRole = "creator" | "brand";

export function getDashboardPath(role: UserRole): string {
  return role === "brand" ? "/creator/dashboard" : "/creator/dashboard";
}
