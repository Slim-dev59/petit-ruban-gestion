import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { code, clientId, clientSecret } = await request.json()

    if (!code || !clientId || !clientSecret) {
      return NextResponse.json({ success: false, error: "Paramètres manquants" }, { status: 400 })
    }

    const requestId = `token-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    const tokenResponse = await fetch("https://api.sumup.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
        "User-Agent": "Boutique-Multi-Createurs/1.0",
        "X-Request-ID": requestId,
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
      console.error("❌ Erreur SumUp token:", tokenData)
      return NextResponse.json(
        {
          success: false,
          error: tokenData.error_description || tokenData.error || "Erreur lors de l'échange du token",
        },
        { status: tokenResponse.status },
      )
    }

    console.log("✅ Token SumUp obtenu avec succès")
    return NextResponse.json({
      success: true,
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresIn: tokenData.expires_in,
    })
  } catch (error) {
    console.error("❌ Erreur serveur token:", error)
    return NextResponse.json({ success: false, error: "Erreur serveur interne" }, { status: 500 })
  }
}
