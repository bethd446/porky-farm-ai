import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Next.js 16 proxy (replaces middleware.ts)
export async function proxy(request: NextRequest) {
  // Pass through all requests - auth protection is client-side
  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
