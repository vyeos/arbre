import { redirect } from "next/navigation";

import AuthForm from "@/app/(auth)/_components/auth-form";
import { getSession } from "@/lib/auth-session";

export default async function SignupPage() {
  const session = await getSession();

  if (session) {
    redirect("/");
  }

  return <AuthForm mode="signup" />;
}
