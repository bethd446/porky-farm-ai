interface WelcomeEmailProps {
  userName: string
  loginUrl?: string
}

export function WelcomeEmail({ userName, loginUrl = "https://www.porkyfarm.app/auth/login" }: WelcomeEmailProps) {
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
          Bienvenue sur PorkyFarm, {userName} !
        </h1>

        <p
          style={{
            fontSize: "16px",
            color: "#4b5563",
            lineHeight: "1.6",
            marginBottom: "24px",
          }}
        >
          Votre compte a ete cree avec succes. Vous pouvez maintenant acceder a toutes les fonctionnalites pour gerer
          votre elevage porcin de maniere professionnelle.
        </p>

        {/* Features */}
        <div
          style={{
            backgroundColor: "#f0fdf4",
            borderRadius: "8px",
            padding: "20px",
            marginBottom: "24px",
          }}
        >
          <h3
            style={{
              fontSize: "14px",
              fontWeight: "600",
              color: "#16a34a",
              marginBottom: "12px",
              textTransform: "uppercase",
            }}
          >
            Ce que vous pouvez faire :
          </h3>
          <ul
            style={{
              margin: "0",
              paddingLeft: "20px",
              color: "#374151",
              fontSize: "14px",
              lineHeight: "1.8",
            }}
          >
            <li>Enregistrer et suivre vos animaux</li>
            <li>Gerer les gestations avec calcul automatique du terme</li>
            <li>Suivre la sante et les traitements</li>
            <li>Calculer les rations alimentaires</li>
            <li>Consulter l&apos;assistant IA pour des conseils</li>
          </ul>
        </div>

        {/* CTA Button */}
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <a
            href={loginUrl}
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
            Acceder a mon elevage
          </a>
        </div>

        <p
          style={{
            fontSize: "14px",
            color: "#9ca3af",
            textAlign: "center",
          }}
        >
          Si vous avez des questions, repondez directement a cet email.
        </p>
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
        <p style={{ margin: "0 0 8px 0" }}>© 2025 PorkyFarm - Gestion d&apos;elevage porcin</p>
        <p style={{ margin: "0" }}>
          <a href="https://www.porkyfarm.app" style={{ color: "#16a34a" }}>
            www.porkyfarm.app
          </a>
        </p>
      </div>
    </div>
  )
}
