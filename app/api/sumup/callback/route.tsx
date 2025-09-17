import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")
  const error = searchParams.get("error")
  const errorDescription = searchParams.get("error_description")
  const state = searchParams.get("state")

  // Page HTML de callback qui communique avec la fenêtre parent
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>SumUp Authorization</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
          }
          .container {
            text-align: center;
            padding: 2rem;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
          }
          .spinner {
            width: 40px;
            height: 40px;
            border: 4px solid rgba(255, 255, 255, 0.3);
            border-top: 4px solid white;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 1rem;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          .success { color: #4ade80; }
          .error { color: #f87171; }
        </style>
      </head>
      <body>
        <div class="container">
          ${
            error
              ? `
                <div class="error">
                  <h2>❌ Erreur d'autorisation</h2>
                  <p>${errorDescription || error}</p>
                  <p>Cette fenêtre va se fermer automatiquement...</p>
                </div>
              `
              : code
                ? `
                <div class="success">
                  <div class="spinner"></div>
                  <h2>✅ Autorisation réussie</h2>
                  <p>Finalisation de la connexion...</p>
                </div>
              `
                : `
                <div class="error">
                  <h2>❌ Paramètres manquants</h2>
                  <p>Code d'autorisation non reçu</p>
                </div>
              `
          }
        </div>

        <script>
          console.log("🔄 SumUp Callback - Paramètres reçus:", {
            code: "${code || ""}",
            error: "${error || ""}",
            errorDescription: "${errorDescription || ""}",
            state: "${state || ""}"
          });

          // Envoyer le résultat à la fenêtre parent
          if (window.opener) {
            if ("${error}") {
              console.error("❌ Erreur OAuth:", "${error}", "${errorDescription}");
              window.opener.postMessage({
                type: "SUMUP_AUTH_ERROR",
                error: "${error}",
                errorDescription: "${errorDescription || ""}"
              }, window.location.origin);
            } else if ("${code}") {
              console.log("✅ Code d'autorisation reçu:", "${code}");
              window.opener.postMessage({
                type: "SUMUP_AUTH_SUCCESS",
                code: "${code}",
                state: "${state || ""}"
              }, window.location.origin);
            } else {
              console.error("❌ Aucun code ou erreur reçu");
              window.opener.postMessage({
                type: "SUMUP_AUTH_ERROR",
                error: "no_code",
                errorDescription: "Aucun code d'autorisation reçu"
              }, window.location.origin);
            }

            // Fermer la fenêtre après un délai
            setTimeout(() => {
              window.close();
            }, 2000);
          } else {
            console.error("❌ Fenêtre parent non trouvée");
            setTimeout(() => {
              window.close();
            }, 3000);
          }
        </script>
      </body>
    </html>
  `

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    },
  })
}
