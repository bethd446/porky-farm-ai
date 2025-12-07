import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Admin - PorkyFarm",
  description: "Panneau d'administration PorkyFarm",
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
