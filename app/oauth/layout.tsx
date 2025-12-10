import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Autorisation OAuth - PorkyFarm",
  description: "Autorisez une application tierce a acceder a votre compte PorkyFarm",
}

export default function OAuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
