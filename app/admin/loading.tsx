export default function AdminLoading() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "#090c15",
      color: "#94a3b8",
      display: "flex",
      fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    }}>
      {/* Sidebar Skeleton */}
      <div style={{
        width: "260px",
        height: "100vh",
        background: "#0c101c",
        borderRight: "1px solid #1a2235",
        padding: "24px 20px",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
      }}>
        <div style={{ height: "32px", width: "140px", background: "#111625", borderRadius: "6px" }} />
        <div style={{ height: "1px", background: "#1a2235", margin: "12px 0" }} />
        <div style={{ height: "36px", background: "#111625", borderRadius: "6px" }} />
        <div style={{ height: "36px", background: "#111625", borderRadius: "6px" }} />
        <div style={{ height: "36px", background: "#111625", borderRadius: "6px" }} />
        <div style={{ height: "36px", background: "#111625", borderRadius: "6px" }} />
      </div>

      {/* Main Skeleton */}
      <div style={{ flex: 1, padding: "32px" }}>
        <div style={{ height: "40px", width: "240px", background: "#111625", borderRadius: "6px", marginBottom: "24px" }} />
        <div style={{ height: "200px", background: "#111625", borderRadius: "10px", marginBottom: "24px" }} />
        <div style={{ height: "400px", background: "#111625", borderRadius: "10px" }} />
      </div>
    </div>
  );
}
