import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { getAllSettings, getDb } from "@/lib/db";
import { AdminDashboardClient } from "./AdminDashboardClient";
import "./admin.css";

export const runtime = "nodejs";

export default async function AdminPage() {
  const authed = await isAuthenticated();
  if (!authed) {
    redirect("/admin/login");
  }

  const settings = getAllSettings();

  // Load summary metrics from SQLite
  const db = getDb();
  const totalStmt = db.prepare("SELECT COUNT(*) as count FROM leads");
  const totalLeads = (totalStmt.get() as { count: number }).count;

  const newStmt = db.prepare("SELECT COUNT(*) as count FROM leads WHERE status = 'new'");
  const newLeads = (newStmt.get() as { count: number }).count;

  const todayStmt = db.prepare(
    "SELECT COUNT(*) as count FROM leads WHERE date(created_at) = date('now', 'localtime')"
  );
  const todayLeads = (todayStmt.get() as { count: number }).count;

  return (
    <div className="admin-body">
      <AdminDashboardClient
        initialSettings={settings}
        metrics={{ totalLeads, newLeads, todayLeads }}
      />
    </div>
  );
}
