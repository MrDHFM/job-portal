import React from "react";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import LoginForm from "./LoginForm";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  const session = await getAdminSession();
  
  // If already authenticated, redirect straight to the admin home/dashboard
  if (session) {
    redirect("/admin");
  }

  return <LoginForm />;
}
