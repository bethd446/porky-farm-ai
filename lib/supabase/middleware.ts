import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  // Just pass through - auth is handled client-side
  return NextResponse.next({ request })
}
