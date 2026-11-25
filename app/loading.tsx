export default function Loading() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--obsidian)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      color: "var(--on-dark-muted)",
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
          border: "2px solid color-mix(in srgb, var(--gold) 15%, transparent)",
          borderTopColor: "var(--gold)",
          animation: "spin 0.8s linear infinite",
        }} />
      </div>

      <div style={{
        fontSize: "12px",
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        color: "var(--gold)",
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
