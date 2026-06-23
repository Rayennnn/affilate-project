import type { Metadata } from "next";
import { LoginForm } from "@/components/LoginForm";

export const metadata: Metadata = {
  title: "Log In — Creatorly",
  description: "Log in to your Creatorly account to continue.",
};

export default function LoginPage() {
  return <LoginForm />;
}
