import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { code, clientId, clientSecret, redirectUri } = await request.json()

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
        redirect_uri: redirectUri,
      }),
    })

    const data = await response.json()

    if (response.ok) {
      return NextResponse.json({
        success: true,
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresIn: data.expires_in,
      })
    } else {
      return NextResponse.json({
        success: false,
        error: data.error_description || data.error || "Erreur lors de l'échange du token",
      })
    }
  } catch (error) {
    console.error("Erreur API token:", error)
    return NextResponse.json({
      success: false,
      error: "Erreur serveur lors de l'échange du token",
    })
  }
}
