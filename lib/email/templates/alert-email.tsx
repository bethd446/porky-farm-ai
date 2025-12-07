interface AlertEmailProps {
  userName: string
  alertType: "vaccination" | "gestation" | "health" | "general"
  alertTitle: string
  alertMessage: string
  animalName?: string
  actionUrl?: string
  actionLabel?: string
}

const alertStyles = {
  vaccination: { bg: "#dbeafe", border: "#3b82f6", icon: "💉" },
  gestation: { bg: "#fce7f3", border: "#ec4899", icon: "🐷" },
  health: { bg: "#fee2e2", border: "#ef4444", icon: "🏥" },
  general: { bg: "#f0fdf4", border: "#16a34a", icon: "📢" },
}

export function AlertEmail({
  userName,
  alertType,
  alertTitle,
  alertMessage,
  animalName,
  actionUrl = "https://www.porkyfarm.app/dashboard",
  actionLabel = "Voir dans l'application",
}: AlertEmailProps) {
  const style = alertStyles[alertType]

  return (
    <div
      style={{
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        maxWidth: "600px",
        margin: "0 auto",
        padding: "40px 20px",
        backgroundColor: "#f9fafb",
      }}
    >
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "12px",
          padding: "40px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "24px",
              fontWeight: "bold",
              color: "#16a34a",
            }}
          >
            🐷 PorkyFarm
          </div>
        </div>

        {/* Alert Badge */}
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <span
            style={{
              display: "inline-block",
              backgroundColor: style.bg,
              padding: "8px 16px",
              borderRadius: "20px",
              fontSize: "14px",
              fontWeight: "500",
              color: "#374151",
            }}
          >
            {style.icon} Alerte{" "}
            {alertType === "vaccination"
              ? "Vaccination"
              : alertType === "gestation"
                ? "Gestation"
                : alertType === "health"
                  ? "Sante"
                  : "Generale"}
          </span>
        </div>

        {/* Content */}
        <h1
          style={{
            fontSize: "24px",
            fontWeight: "600",
            color: "#111827",
            marginBottom: "16px",
            textAlign: "center",
          }}
        >
          {alertTitle}
        </h1>

        <p
          style={{
            fontSize: "16px",
            color: "#4b5563",
            lineHeight: "1.6",
            marginBottom: "16px",
          }}
        >
          Bonjour {userName},
        </p>

        {/* Alert box */}
        <div
          style={{
            backgroundColor: style.bg,
            borderRadius: "8px",
            padding: "20px",
            marginBottom: "24px",
            borderLeft: `4px solid ${style.border}`,
          }}
        >
          {animalName && (
            <p
              style={{
                margin: "0 0 8px 0",
                fontSize: "14px",
                fontWeight: "600",
                color: "#374151",
              }}
            >
              Animal : {animalName}
            </p>
          )}
          <p
            style={{
              margin: "0",
              fontSize: "14px",
              color: "#374151",
              lineHeight: "1.6",
            }}
          >
            {alertMessage}
          </p>
        </div>

        {/* CTA Button */}
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <a
            href={actionUrl}
            style={{
              display: "inline-block",
              backgroundColor: "#16a34a",
              color: "#ffffff",
              padding: "14px 32px",
              borderRadius: "8px",
              textDecoration: "none",
              fontWeight: "600",
              fontSize: "16px",
            }}
          >
            {actionLabel}
          </a>
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          textAlign: "center",
          marginTop: "24px",
          fontSize: "12px",
          color: "#9ca3af",
        }}
      >
        <p style={{ margin: "0 0 8px 0" }}>Vous recevez cet email car vous avez active les notifications.</p>
        <p style={{ margin: "0" }}>
          © 2025 PorkyFarm |{" "}
          <a href="https://www.porkyfarm.app/dashboard/settings" style={{ color: "#16a34a" }}>
            Gerer mes notifications
          </a>
        </p>
      </div>
    </div>
  )
}
