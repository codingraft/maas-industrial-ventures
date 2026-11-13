import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { getAllSettings, getLeadMetrics } from "@/lib/db";
import { AdminDashboardClient } from "./AdminDashboardClient";
import "./admin.css";

export const runtime = "nodejs";

export default async function AdminPage() {
  const authed = await isAuthenticated();
  if (!authed) {
    redirect("/admin/login");
  }

  const [settings, metrics] = await Promise.all([
    getAllSettings(),
    getLeadMetrics(),
  ]);

  return (
    <div className="admin-body">
      <AdminDashboardClient
        initialSettings={settings}
        metrics={metrics}
      />
    </div>
  );
}
