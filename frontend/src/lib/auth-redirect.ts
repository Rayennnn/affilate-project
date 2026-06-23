export type UserRole = "creator" | "brand" | "admin";

// The home dashboard each role lands on after authentication.
export function getDashboardPath(role: UserRole): string {
  switch (role) {
    case "brand":
      return "/brand/dashboard";
    case "admin":
      return "/admin/dashboard";
    default:
      return "/creator/dashboard";
  }
}

// The top-level URL segment a role is allowed to access.
export function roleSegment(role: UserRole): string {
  switch (role) {
    case "brand":
      return "/brand";
    case "admin":
      return "/admin";
    default:
      return "/creator";
  }
}
