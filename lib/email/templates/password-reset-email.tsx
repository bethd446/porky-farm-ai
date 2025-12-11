import * as React from "react";

/**
 * Password reset email template
 * Follows Resend official documentation pattern for React email templates
 */
interface PasswordResetEmailProps {
  userName: string;
  resetUrl: string;
  expiresIn?: string;
}

export function PasswordResetEmail({
  userName,
  resetUrl,
  expiresIn = "1 heure",
}: PasswordResetEmailProps) {
  return (
    <div
      style={{
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
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
          Reinitialisation du mot de passe
        </h1>

        <p
          style={{
            fontSize: "16px",
            color: "#4b5563",
            lineHeight: "1.6",
            marginBottom: "24px",
          }}
        >
          Bonjour {userName},<br />
          <br />
          Vous avez demande la reinitialisation de votre mot de passe PorkyFarm.
          Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe.
        </p>

        {/* Warning box */}
        <div
          style={{
            backgroundColor: "#fef3c7",
            borderRadius: "8px",
            padding: "16px",
            marginBottom: "24px",
            borderLeft: "4px solid #f59e0b",
          }}
        >
          <p
            style={{
              margin: "0",
              fontSize: "14px",
              color: "#92400e",
            }}
          >
            Ce lien expire dans <strong>{expiresIn}</strong>. Si vous
            n&apos;avez pas demande cette reinitialisation, ignorez cet email.
          </p>
        </div>

        {/* CTA Button */}
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <a
            href={resetUrl}
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
            Reinitialiser mon mot de passe
          </a>
        </div>

        <p
          style={{
            fontSize: "14px",
            color: "#9ca3af",
            textAlign: "center",
          }}
        >
          Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :
          <br />
          <a
            href={resetUrl}
            style={{ color: "#16a34a", wordBreak: "break-all" }}
          >
            {resetUrl}
          </a>
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
        <p style={{ margin: "0 0 8px 0" }}>
          © 2025 PorkyFarm - Gestion d&apos;elevage porcin
        </p>
        <p style={{ margin: "0" }}>
          <a href="https://www.porkyfarm.app" style={{ color: "#16a34a" }}>
            www.porkyfarm.app
          </a>
        </p>
      </div>
    </div>
  );
}
