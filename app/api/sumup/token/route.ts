import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { code, clientId, clientSecret } = await request.json()

    if (!code || !clientId || !clientSecret) {
      return NextResponse.json({ success: false, error: "Paramètres manquants" }, { status: 400 })
    }

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
        redirect_uri: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/sumup/callback`,
      }),
    })

    const tokenData = await tokenResponse.json()

    if (!tokenResponse.ok) {
      return NextResponse.json(
        { success: false, error: tokenData.error_description || "Erreur lors de l'échange du token" },
        { status: 400 },
      )
    }

    return NextResponse.json({
      success: true,
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresIn: tokenData.expires_in,
    })
  } catch (error) {
    console.error("Erreur API token:", error)
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 })
  }
}
