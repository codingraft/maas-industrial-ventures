export default function Loading() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "#05070c",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      color: "#94a3b8",
      fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    }}>
      <div style={{
        position: "relative",
        width: "48px",
        height: "48px",
        marginBottom: "20px",
      }}>
        <div style={{
          width: "100%",
          height: "100%",
          borderRadius: "50%",
          border: "2px solid rgba(212, 175, 55, 0.15)",
          borderTopColor: "#d4af37",
          animation: "spin 0.8s linear infinite",
        }} />
      </div>

      <div style={{
        fontSize: "12px",
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        color: "#d4af37",
        fontWeight: "600",
      }}>
        MAAS INDUSTRIAL VENTURES
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}} />
    </div>
  );
}
