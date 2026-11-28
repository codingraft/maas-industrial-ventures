import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { AdminLoginClient } from "./AdminLoginClient";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  if (await isAuthenticated()) {
    redirect("/admin");
  }

  return <AdminLoginClient />;
}
