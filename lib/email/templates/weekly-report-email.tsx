interface WeeklyReportEmailProps {
  userName: string
  farmName?: string
  reportDate: string
  stats: {
    totalAnimals: number
    newBirths: number
    gestationsInProgress: number
    upcomingBirths: number
    healthCases: number
    resolvedCases: number
  }
  alerts: Array<{
    type: string
    message: string
  }>
  dashboardUrl?: string
}

export function WeeklyReportEmail({
  userName,
  farmName = "Mon élevage",
  reportDate,
  stats,
  alerts,
  dashboardUrl = "https://www.porkyfarm.app/dashboard",
}: WeeklyReportEmailProps) {
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

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <h1
            style={{
              fontSize: "24px",
              fontWeight: "600",
              color: "#111827",
              marginBottom: "8px",
            }}
          >
            Rapport Hebdomadaire
          </h1>
          <p style={{ fontSize: "14px", color: "#6b7280", margin: 0 }}>
            {farmName} - Semaine du {reportDate}
          </p>
        </div>

        <p style={{ fontSize: "16px", color: "#4b5563", marginBottom: "24px" }}>
          Bonjour {userName}, voici le résumé de votre élevage cette semaine.
        </p>

        {/* Stats Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "16px",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              backgroundColor: "#f0fdf4",
              borderRadius: "8px",
              padding: "16px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "28px", fontWeight: "bold", color: "#16a34a" }}>{stats.totalAnimals}</div>
            <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "4px" }}>Total animaux</div>
          </div>
          <div
            style={{
              backgroundColor: "#fce7f3",
              borderRadius: "8px",
              padding: "16px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "28px", fontWeight: "bold", color: "#db2777" }}>{stats.newBirths}</div>
            <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "4px" }}>Naissances</div>
          </div>
          <div
            style={{
              backgroundColor: "#dbeafe",
              borderRadius: "8px",
              padding: "16px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "28px", fontWeight: "bold", color: "#2563eb" }}>{stats.gestationsInProgress}</div>
            <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "4px" }}>Gestations en cours</div>
          </div>
          <div
            style={{
              backgroundColor: "#fef3c7",
              borderRadius: "8px",
              padding: "16px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "28px", fontWeight: "bold", color: "#d97706" }}>{stats.upcomingBirths}</div>
            <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "4px" }}>Mise-bas prévues</div>
          </div>
        </div>

        {/* Health Summary */}
        <div
          style={{
            backgroundColor: "#f9fafb",
            borderRadius: "8px",
            padding: "16px",
            marginBottom: "24px",
          }}
        >
          <h3 style={{ fontSize: "14px", fontWeight: "600", color: "#374151", marginBottom: "12px" }}>
            🏥 Suivi Sanitaire
          </h3>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
            <span style={{ color: "#6b7280" }}>Cas en cours :</span>
            <span style={{ fontWeight: "600", color: stats.healthCases > 0 ? "#dc2626" : "#16a34a" }}>
              {stats.healthCases}
            </span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", marginTop: "8px" }}>
            <span style={{ color: "#6b7280" }}>Cas résolus cette semaine :</span>
            <span style={{ fontWeight: "600", color: "#16a34a" }}>{stats.resolvedCases}</span>
          </div>
        </div>

        {/* Alerts */}
        {alerts.length > 0 && (
          <div
            style={{
              backgroundColor: "#fef2f2",
              borderRadius: "8px",
              padding: "16px",
              marginBottom: "24px",
              borderLeft: "4px solid #ef4444",
            }}
          >
            <h3 style={{ fontSize: "14px", fontWeight: "600", color: "#991b1b", marginBottom: "12px" }}>
              ⚠️ Alertes à traiter
            </h3>
            <ul style={{ margin: 0, paddingLeft: "20px", fontSize: "14px", color: "#7f1d1d" }}>
              {alerts.slice(0, 5).map((alert, i) => (
                <li key={i} style={{ marginBottom: "8px" }}>
                  <strong>{alert.type}</strong>: {alert.message}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* CTA */}
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <a
            href={dashboardUrl}
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
            Voir mon tableau de bord
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
        <p style={{ margin: "0 0 8px 0" }}>Vous recevez ce rapport car vous avez activé les rapports hebdomadaires.</p>
        <p style={{ margin: "0" }}>
          © 2025 PorkyFarm |{" "}
          <a href="https://www.porkyfarm.app/dashboard/settings" style={{ color: "#16a34a" }}>
            Gérer mes préférences
          </a>
        </p>
      </div>
    </div>
  )
}
