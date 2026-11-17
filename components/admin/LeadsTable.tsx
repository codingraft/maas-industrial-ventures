"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Lead } from "@/lib/types";
import { Pagination } from "@/components/ui/Pagination";
import { ToastContainer, ConfirmModal, ToastMessage } from "@/components/admin/AdminDialogs";
import { TableSkeleton, CardSkeleton } from "@/components/admin/ui/AdminSkeleton";
import { AdminBadge, AdminBadgeVariant } from "@/components/admin/ui/AdminBadge";
import { AdminToolbar, AdminSearchInput } from "@/components/admin/ui/AdminToolbar";

function getStatusBadgeVariant(status: string): AdminBadgeVariant {
  switch (status) {
    case "new":
      return "info";
    case "contacted":
      return "warning";
    case "qualified":
      return "gold";
    case "converted":
      return "success";
    case "archived":
    default:
      return "neutral";
  }
}

export function LeadsTable() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [projectFilter, setProjectFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLeads, setTotalLeads] = useState(0);

  const [activeNotesLead, setActiveNotesLead] = useState<Lead | null>(null);
  const [notesText, setNotesText] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);

  // In-app toasts & confirm dialog
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    leadId: number | string | null;
    leadName: string;
    isDeleting: boolean;
  }>({
    isOpen: false,
    leadId: null,
    leadName: "",
    isDeleting: false,
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  function addToast(type: "success" | "error" | "info", title: string, message?: string) {
    const id = "toast-" + Date.now() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }

  function dismissToast(id: string) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  const fetchLeads = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setFetchError(null);

    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (projectFilter !== "all") params.set("project", projectFilter);
      params.set("page", String(currentPage));
      params.set("limit", String(pageSize));

      const res = await fetch(`/api/admin/leads?${params.toString()}`, {
        signal: controller.signal,
      });

      if (!res.ok) throw new Error("Server responded with error status " + res.status);
      const data = await res.json();
      setLeads(data.leads || []);
      if (data.pagination) {
        setTotalPages(data.pagination.totalPages || 1);
        setTotalLeads(data.pagination.total || 0);
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        return;
      }
      console.error("Failed to load leads:", err);
      setFetchError(err instanceof Error ? err.message : "Failed to load leads. Please check connection.");
      addToast("error", "Error loading leads", "Could not fetch leads from database.");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, projectFilter, currentPage, pageSize]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLeads();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchLeads]);

  function handleSearchChange(val: string) {
    setSearch(val);
    setCurrentPage(1);
  }

  function handleFilterChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  }

  function handlePageSizeChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setPageSize(parseInt(e.target.value, 10));
    setCurrentPage(1);
  }

  async function handleStatusChange(id: number | string, nextStatus: string) {
    try {
      const res = await fetch("/api/admin/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: nextStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      setLeads((prev) =>
        prev.map((l) => (l.id === id ? { ...l, status: nextStatus as Lead["status"] } : l))
      );
      addToast("success", "Status updated", `Lead #${id} marked as ${nextStatus}.`);
    } catch (err) {
      console.error(err);
      addToast("error", "Status update failed", "Could not update lead status in database.");
    }
  }

  function promptDelete(id: number | string, name: string) {
    setDeleteDialog({
      isOpen: true,
      leadId: id,
      leadName: name,
      isDeleting: false,
    });
  }

  async function confirmDeleteLead() {
    if (!deleteDialog.leadId) return;
    setDeleteDialog((prev) => ({ ...prev, isDeleting: true }));

    try {
      const res = await fetch(`/api/admin/leads?id=${deleteDialog.leadId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete lead");
      addToast("success", "Lead deleted", `Record for ${deleteDialog.leadName} has been permanently deleted.`);
      setDeleteDialog({ isOpen: false, leadId: null, leadName: "", isDeleting: false });
      fetchLeads();
    } catch (err) {
      console.error(err);
      addToast("error", "Delete failed", "Could not delete lead.");
      setDeleteDialog((prev) => ({ ...prev, isDeleting: false }));
    }
  }

  async function handleSaveNotes() {
    if (!activeNotesLead) return;
    setSavingNotes(true);
    try {
      const res = await fetch("/api/admin/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: activeNotesLead.id, notes: notesText }),
      });
      if (!res.ok) throw new Error("Failed to save notes");
      setLeads((prev) =>
        prev.map((l) => (l.id === activeNotesLead.id ? { ...l, notes: notesText } : l))
      );
      addToast("success", "Notes updated", `Saved internal notes for ${activeNotesLead.name}.`);
      setActiveNotesLead(null);
    } catch (err) {
      console.error(err);
      addToast("error", "Failed to save notes", "Could not persist notes.");
    } finally {
      setSavingNotes(false);
    }
  }

  function handleExportCsv() {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (statusFilter !== "all") params.set("status", statusFilter);
    if (projectFilter !== "all") params.set("project", projectFilter);
    params.set("export", "csv");
    window.open(`/api/admin/leads?${params.toString()}`, "_blank");
  }

  function cleanPhoneForWhatsApp(phone: string): string {
    const digits = phone.replace(/\D/g, "");
    if (digits.length === 10) return "91" + digits;
    return digits;
  }

  return (
    <div>
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      <ConfirmModal
        isOpen={deleteDialog.isOpen}
        title="Delete Inbound Lead Record"
        message={`Are you sure you want to delete lead #${deleteDialog.leadId} (${deleteDialog.leadName})? This action cannot be undone.`}
        confirmLabel="Delete Lead"
        isDanger={true}
        isLoading={deleteDialog.isDeleting}
        onConfirm={confirmDeleteLead}
        onCancel={() => setDeleteDialog({ isOpen: false, leadId: null, leadName: "", isDeleting: false })}
      />

      {fetchError && (
        <div style={{
          background: "rgba(239, 68, 68, 0.12)",
          border: "1px solid rgba(239, 68, 68, 0.3)",
          color: "#fca5a5",
          padding: "12px 18px",
          borderRadius: "8px",
          marginBottom: "16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <div>
            <strong>Unable to load leads:</strong> {fetchError}
          </div>
          <button
            type="button"
            className="admin-btn admin-btn-secondary"
            onClick={() => fetchLeads()}
            style={{ padding: "6px 14px", fontSize: "12px" }}
          >
            Retry
          </button>
        </div>
      )}

      {/* Standardized Search & Action Toolbar */}
      <AdminToolbar
        actions={
          <button
            type="button"
            className="btn-gold"
            onClick={handleExportCsv}
            title="Download filtered leads for CRM or Excel"
            style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <span>Export CSV</span>
          </button>
        }
      >
        <AdminSearchInput
          placeholder="Search by name, phone, email, plot..."
          value={search}
          onChange={handleSearchChange}
        />

        <select
          className="admin-select"
          value={statusFilter}
          onChange={handleFilterChange}
          aria-label="Filter by Status"
        >
          <option value="all">All Statuses</option>
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="qualified">Qualified</option>
          <option value="converted">Converted</option>
          <option value="archived">Archived</option>
        </select>

        <select
          className="admin-select"
          value={projectFilter}
          onChange={(e) => {
            setProjectFilter(e.target.value);
            setCurrentPage(1);
          }}
          aria-label="Filter by Project"
        >
          <option value="all">All Projects</option>
          <option value="Gayatri Industrial Park (Bhojpur, Modinagar)">Gayatri Industrial Park</option>
          <option value="Shri Balaji Industrial Park (Hapur-Modinagar Rd)">Shri Balaji Industrial Park</option>
          <option value="Residential Plotted Developments">Residential Plotted</option>
          <option value="General Industrial Land Consultation">General Consultation</option>
        </select>

        <select
          className="admin-select"
          value={pageSize}
          onChange={handlePageSizeChange}
          title="Rows per page"
          aria-label="Rows per page"
        >
          <option value={10}>10 per page</option>
          <option value={25}>25 per page</option>
          <option value={50}>50 per page</option>
        </select>
      </AdminToolbar>

      {/* Desktop Table View */}
      <div className="admin-table-wrapper desktop-only">
        {loading ? (
          <TableSkeleton rows={pageSize > 10 ? 10 : pageSize} cols={6} />
        ) : leads.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 20px", color: "var(--admin-text-muted)" }}>
            <div style={{ fontSize: "28px", marginBottom: "8px" }}>📋</div>
            <div style={{ fontWeight: 600, color: "var(--admin-text-main)" }}>No leads found</div>
            <div style={{ fontSize: "12px", marginTop: "4px" }}>Try adjusting your search terms or filters</div>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: "120px" }}>ID &amp; Date</th>
                <th>Lead Contact</th>
                <th>Project &amp; Requirement</th>
                <th>Ad Attribution</th>
                <th style={{ width: "130px" }}>Status</th>
                <th style={{ width: "160px", textAlign: "right" }}>Quick Actions</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => {
                const waPhone = cleanPhoneForWhatsApp(lead.phone);
                const waMessage = encodeURIComponent(
                  `Hello ${lead.name}, thank you for enquiring with MAAS Industrial Ventures. I am contacting you regarding your space requirements.`
                );

                return (
                  <tr key={lead.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: "var(--admin-text-main)", fontSize: "12.5px" }}>
                        #{lead.id}
                      </div>
                      <div style={{ fontSize: "11px", color: "var(--admin-text-dim)", marginTop: "2px" }}>
                        {lead.created_at}
                      </div>
                    </td>

                    <td>
                      <div style={{ fontWeight: 600, color: "var(--admin-text-main)", fontSize: "13px" }}>
                        {lead.name}
                      </div>
                      <div style={{ fontSize: "12px", marginTop: "2px" }}>
                        <a href={`tel:${lead.phone}`} style={{ color: "var(--admin-gold)", textDecoration: "none" }}>
                          {lead.phone}
                        </a>
                      </div>
                      <div style={{ fontSize: "11px", color: "var(--admin-text-muted)", marginTop: "1px" }}>
                        <a href={`mailto:${lead.email}`} style={{ color: "var(--admin-text-muted)", textDecoration: "none" }}>
                          {lead.email}
                        </a>
                      </div>
                    </td>

                    <td>
                      {lead.project && (
                        <div style={{ marginBottom: "5px" }}>
                          <AdminBadge variant="gold">{lead.project}</AdminBadge>
                        </div>
                      )}
                      {lead.industry && (
                        <div style={{ fontSize: "12px", color: "var(--admin-text-secondary)" }}>
                          <span style={{ color: "var(--admin-text-dim)" }}>Sector:</span> {lead.industry}
                        </div>
                      )}
                      {lead.requirement && (
                        <div style={{ fontSize: "12px", color: "var(--admin-text-secondary)" }}>
                          <span style={{ color: "var(--admin-text-dim)" }}>Area:</span> {lead.requirement}
                        </div>
                      )}
                      {lead.message && (
                        <div
                          style={{
                            fontSize: "11.5px",
                            color: "var(--admin-text-muted)",
                            marginTop: "4px",
                            maxWidth: "280px",
                            fontStyle: "italic",
                          }}
                        >
                          &ldquo;{lead.message}&rdquo;
                        </div>
                      )}
                      {lead.notes && (
                        <div
                          style={{
                            marginTop: "6px",
                            padding: "4px 8px",
                            background: "var(--admin-bg-hover)",
                            borderLeft: "2px solid var(--admin-gold)",
                            borderRadius: "4px",
                            fontSize: "11px",
                            color: "var(--admin-gold)",
                          }}
                        >
                          <strong>Note:</strong> {lead.notes}
                        </div>
                      )}
                    </td>

                    <td>
                      {lead.utm_source || lead.utm_campaign ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                          <AdminBadge variant="info">{lead.utm_source || "Campaign"}</AdminBadge>
                          {lead.utm_campaign && (
                            <div style={{ fontSize: "11px", color: "var(--admin-text-dim)" }}>
                              {lead.utm_campaign}
                            </div>
                          )}
                          {lead.gclid && (
                            <span style={{ color: "#38bdf8", fontSize: "10px", fontWeight: 600 }}>Google Ads</span>
                          )}
                          {lead.fbclid && (
                            <span style={{ color: "#818cf8", fontSize: "10px", fontWeight: 600 }}>Meta Ads</span>
                          )}
                        </div>
                      ) : (
                        <span style={{ fontSize: "11.5px", color: "var(--admin-text-dim)" }}>Direct / Organic</span>
                      )}
                    </td>

                    <td>
                      <select
                        value={lead.status}
                        onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                        className={`admin-badge admin-badge-${getStatusBadgeVariant(lead.status)}`}
                        style={{
                          cursor: "pointer",
                          appearance: "none",
                          padding: "4px 10px",
                          borderWidth: "1px",
                          outline: "none",
                        }}
                        aria-label={`Status for lead ${lead.id}`}
                      >
                        <option value="new" style={{ background: "#111827", color: "#60a5fa" }}>● New</option>
                        <option value="contacted" style={{ background: "#111827", color: "#fbbf24" }}>● Contacted</option>
                        <option value="qualified" style={{ background: "#111827", color: "#d4af37" }}>● Qualified</option>
                        <option value="converted" style={{ background: "#111827", color: "#4ade80" }}>● Converted</option>
                        <option value="archived" style={{ background: "#111827", color: "#94a3b8" }}>● Archived</option>
                      </select>
                    </td>

                    <td style={{ textAlign: "right" }}>
                      <div className="lead-quick-actions" style={{ justifyContent: "flex-end" }}>
                        <a
                          href={`https://wa.me/${waPhone}?text=${waMessage}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="action-icon-btn action-icon-whatsapp"
                          title="Chat on WhatsApp"
                        >
                          💬 WA
                        </a>
                        <a
                          href={`tel:${lead.phone}`}
                          className="action-icon-btn"
                          title="Call Lead"
                        >
                          📞 Call
                        </a>
                        <button
                          type="button"
                          className="action-icon-btn"
                          onClick={() => {
                            setActiveNotesLead(lead);
                            setNotesText(lead.notes || "");
                          }}
                          title="Edit internal notes"
                        >
                          📝 Note
                        </button>
                        <button
                          type="button"
                          className="btn-danger"
                          onClick={() => promptDelete(lead.id, lead.name)}
                          title="Delete Lead"
                        >
                          ✕
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Mobile Responsive Cards View */}
      <div className="mobile-cards-list mobile-only">
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : leads.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 16px", color: "var(--admin-text-muted)" }}>
            No leads found matching criteria.
          </div>
        ) : (
          leads.map((lead) => {
            const waPhone = cleanPhoneForWhatsApp(lead.phone);
            const waMessage = encodeURIComponent(
              `Hello ${lead.name}, thank you for enquiring with MAAS Industrial Ventures. I am contacting you regarding your space requirements.`
            );

            return (
              <div key={lead.id} className="mobile-lead-card">
                <div className="mobile-lead-header">
                  <div>
                    <h3 className="mobile-lead-name">{lead.name}</h3>
                    <span className="mobile-lead-time">#{lead.id} · {lead.created_at}</span>
                  </div>
                  <select
                    value={lead.status}
                    onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                    className={`admin-badge admin-badge-${getStatusBadgeVariant(lead.status)}`}
                    style={{ cursor: "pointer" }}
                  >
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="qualified">Qualified</option>
                    <option value="converted">Converted</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>

                <div className="mobile-lead-body">
                  <div className="mobile-lead-contact">
                    <a href={`tel:${lead.phone}`} className="mobile-phone-link">
                      📞 {lead.phone}
                    </a>
                    <a href={`mailto:${lead.email}`} className="mobile-email-link">
                      ✉ {lead.email}
                    </a>
                  </div>

                  {(lead.requirement || lead.industry) && (
                    <div className="mobile-lead-req">
                      {lead.industry && <div><b>Sector:</b> {lead.industry}</div>}
                      {lead.requirement && <div><b>Space:</b> {lead.requirement}</div>}
                    </div>
                  )}

                  {lead.message && (
                    <p className="mobile-lead-msg">&ldquo;{lead.message}&rdquo;</p>
                  )}

                  {lead.notes && (
                    <div className="mobile-lead-note">
                      <b>Internal Note:</b> {lead.notes}
                    </div>
                  )}

                  {lead.utm_source && (
                    <div className="mobile-lead-ad">
                      <span>Ad Source: <b>{lead.utm_source}</b></span>
                      {lead.utm_campaign && <span> · Camp: {lead.utm_campaign}</span>}
                    </div>
                  )}
                </div>

                <div className="mobile-lead-actions">
                  <a
                    href={`https://wa.me/${waPhone}?text=${waMessage}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-gold"
                    style={{ flex: 1, justifyContent: "center", textDecoration: "none" }}
                  >
                    💬 WhatsApp
                  </a>
                  <a
                    href={`tel:${lead.phone}`}
                    className="btn-secondary"
                    style={{ flex: 1, justifyContent: "center", textDecoration: "none" }}
                  >
                    📞 Call
                  </a>
                  <button
                    type="button"
                    className="btn-icon"
                    onClick={() => {
                      setActiveNotesLead(lead);
                      setNotesText(lead.notes || "");
                    }}
                    title="Edit Note"
                    aria-label="Edit Note"
                  >
                    📝
                  </button>
                  <button
                    type="button"
                    className="btn-icon btn-danger"
                    onClick={() => promptDelete(lead.id, lead.name)}
                    title="Delete Lead"
                    aria-label="Delete Lead"
                  >
                    ✕
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination Controls */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        totalItems={totalLeads}
        pageSize={pageSize}
      />

      {/* Internal Notes Modal */}
      {activeNotesLead && (
        <div
          className="admin-modal-overlay"
          onClick={() => setActiveNotesLead(null)}
        >
          <div
            className="admin-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: "0 0 8px", color: "var(--admin-text-main)" }}>
              Lead Notes: {activeNotesLead.name} (#{activeNotesLead.id})
            </h3>
            <p style={{ margin: "0 0 16px", color: "var(--admin-text-muted)", fontSize: "12px" }}>
              Record discussion summary, budget, site visit appointments, or specific infrastructure requests.
            </p>
            <textarea
              className="form-control"
              rows={4}
              value={notesText}
              onChange={(e) => setNotesText(e.target.value)}
              placeholder="e.g. Requires 15-acre plot with 33kV dedicated power sub-station. Site visit scheduled for Friday."
            />
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "16px" }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setActiveNotesLead(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-gold"
                onClick={handleSaveNotes}
                disabled={savingNotes}
              >
                {savingNotes ? "Saving…" : "Save Note"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
