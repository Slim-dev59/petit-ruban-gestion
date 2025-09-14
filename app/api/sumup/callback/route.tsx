import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")
  const error = searchParams.get("error")
  const state = searchParams.get("state")

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Autorisation SumUp</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          }
          .container {
            background: white;
            padding: 2rem;
            border-radius: 12px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
            text-align: center;
            max-width: 400px;
          }
          .success { color: #10b981; }
          .error { color: #ef4444; }
          .icon { font-size: 3rem; margin-bottom: 1rem; }
        </style>
      </head>
      <body>
        <div class="container">
          ${
            error
              ? `
            <div class="icon">❌</div>
            <h2 class="error">Erreur d'autorisation</h2>
            <p>Une erreur est survenue lors de l'autorisation SumUp.</p>
            <p><strong>Erreur:</strong> ${error}</p>
          `
              : code
                ? `
            <div class="icon">✅</div>
            <h2 class="success">Autorisation réussie !</h2>
            <p>Vous pouvez fermer cette fenêtre.</p>
          `
                : `
            <div class="icon">⚠️</div>
            <h2>Paramètres manquants</h2>
            <p>Code d'autorisation non reçu.</p>
          `
          }
        </div>
        
        <script>
          // Envoyer le résultat à la fenêtre parent
          if (window.opener) {
            if ('${error}') {
              window.opener.postMessage({
                type: 'SUMUP_AUTH_ERROR',
                error: '${error}'
              }, window.location.origin);
            } else if ('${code}') {
              window.opener.postMessage({
                type: 'SUMUP_AUTH_SUCCESS',
                code: '${code}',
                state: '${state}'
              }, window.location.origin);
            }
            
            // Fermer la popup après un court délai
            setTimeout(() => {
              window.close();
            }, 2000);
          }
        </script>
      </body>
    </html>
  `

  return new Response(html, {
    headers: {
      "Content-Type": "text/html",
    },
  })
}
