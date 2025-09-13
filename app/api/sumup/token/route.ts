import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { code, clientId, clientSecret } = await request.json()

    // Échanger le code d'autorisation contre un token d'accès
    const tokenResponse = await fetch("https://api.sumup.com/token", {
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

    if (!tokenResponse.ok) {
      throw new Error("Erreur lors de l'échange du token")
    }

    const tokenData = await tokenResponse.json()

    return NextResponse.json({
      success: true,
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresIn: tokenData.expires_in,
    })
  } catch (error) {
    console.error("Erreur token SumUp:", error)
    return NextResponse.json({ success: false, error: "Erreur lors de l'authentification" }, { status: 500 })
  }
}
