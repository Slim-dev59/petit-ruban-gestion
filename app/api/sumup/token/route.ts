import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Appel à l'API SumUp pour échanger le code contre un token
    const response = await fetch("https://api.sumup.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: body.grant_type,
        client_id: body.client_id,
        client_secret: body.client_secret,
        code: body.code,
        redirect_uri: body.redirect_uri,
      }),
    })

    if (!response.ok) {
      throw new Error("Erreur lors de l'échange du token")
    }

    const tokenData = await response.json()

    return NextResponse.json(tokenData)
  } catch (error) {
    console.error("Erreur API token:", error)
    return NextResponse.json({ error: "Erreur lors de l'authentification" }, { status: 500 })
  }
}
