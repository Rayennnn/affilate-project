import type { Metadata } from "next";
import { SignUpForm } from "@/components/SignUpForm";

export const metadata: Metadata = {
  title: "Sign Up — Creatorly",
  description: "Create your Creatorly account and start earning.",
};

export default function SignUpPage() {
  return <SignUpForm />;
}
