import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")
  const error = searchParams.get("error")
  const state = searchParams.get("state")

  // Page HTML qui communique avec la fenêtre parent
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>SumUp Authorization</title>
      </head>
      <body>
        <div style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
          ${
            error
              ? `
                <h2 style="color: #dc2626;">Erreur d'autorisation</h2>
                <p>Une erreur est survenue lors de l'autorisation SumUp.</p>
                <p style="color: #6b7280;">Erreur: ${error}</p>
              `
              : code
                ? `
                  <h2 style="color: #059669;">Autorisation réussie</h2>
                  <p>Vous pouvez fermer cette fenêtre.</p>
                `
                : `
                  <h2 style="color: #dc2626;">Erreur</h2>
                  <p>Code d'autorisation manquant.</p>
                `
          }
        </div>
        <script>
          if (window.opener) {
            window.opener.postMessage({
              type: ${error ? '"SUMUP_AUTH_ERROR"' : code ? '"SUMUP_AUTH_SUCCESS"' : '"SUMUP_AUTH_ERROR"'},
              ${code ? `code: "${code}",` : ""}
              ${error ? `error: "${error}",` : ""}
              ${state ? `state: "${state}"` : ""}
            }, window.location.origin);
          }
          setTimeout(() => window.close(), 2000);
        </script>
      </body>
    </html>
  `

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html",
    },
  })
}
