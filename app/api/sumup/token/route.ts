import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { code, clientId, clientSecret } = await request.json()

    // En production, faire l'appel réel à l'API SumUp
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
        redirect_uri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/sumup/callback`,
      }),
    })

    if (!response.ok) {
      throw new Error("Erreur lors de l'échange du code")
    }

    const tokenData = await response.json()

    return NextResponse.json(tokenData)
  } catch (error) {
    console.error("Erreur API SumUp token:", error)
    return NextResponse.json({ error: "Erreur lors de l'authentification" }, { status: 500 })
  }
}
