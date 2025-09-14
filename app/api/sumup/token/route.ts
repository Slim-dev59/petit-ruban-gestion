import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { code, clientId, clientSecret } = await request.json()

    const response = await fetch("https://api.sumup.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json({ error: "Erreur lors de l'échange du token" }, { status: response.status })
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur lors de l'authentification" }, { status: 500 })
  }
}
