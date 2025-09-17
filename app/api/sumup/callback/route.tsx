import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")
  const error = searchParams.get("error")
  const errorDescription = searchParams.get("error_description")
  const state = searchParams.get("state")

  // Page HTML de callback qui communique avec la fenêtre parent
  const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
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
            color: white;
        }
        .container {
            text-align: center;
            padding: 2rem;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 1rem;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            max-width: 400px;
            width: 90%;
        }
        .icon {
            font-size: 3rem;
            margin-bottom: 1rem;
        }
        .success { color: #10b981; }
        .error { color: #ef4444; }
        .loading {
            display: inline-block;
            width: 20px;
            height: 20px;
            border: 3px solid rgba(255,255,255,.3);
            border-radius: 50%;
            border-top-color: #fff;
            animation: spin 1s ease-in-out infinite;
        }
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
        h1 { margin: 0 0 1rem 0; font-size: 1.5rem; }
        p { margin: 0.5rem 0; opacity: 0.9; }
        .details {
            background: rgba(0, 0, 0, 0.2);
            padding: 1rem;
            border-radius: 0.5rem;
            margin-top: 1rem;
            font-family: monospace;
            font-size: 0.875rem;
            text-align: left;
        }
    </style>
</head>
<body>
    <div class="container">
        <div id="content">
            <div class="loading"></div>
            <h1>Traitement en cours...</h1>
            <p>Veuillez patienter pendant que nous traitons votre autorisation SumUp.</p>
        </div>
    </div>

    <script>
        console.log('🔄 Page de callback SumUp chargée');
        console.log('📋 Paramètres URL:', {
            code: '${code}',
            error: '${error}',
            errorDescription: '${errorDescription}',
            state: '${state}'
        });

        function updateUI(type, title, message, details = null) {
            const content = document.getElementById('content');
            const iconClass = type === 'success' ? 'success' : 'error';
            const icon = type === 'success' ? '✅' : '❌';
            
            content.innerHTML = \`
                <div class="icon \${iconClass}">\${icon}</div>
                <h1>\${title}</h1>
                <p>\${message}</p>
                \${details ? \`<div class="details">\${details}</div>\` : ''}
            \`;
        }

        function sendMessageToParent(type, data) {
            console.log(\`📤 Envoi du message au parent: \${type}\`, data);
            
            if (window.opener) {
                try {
                    window.opener.postMessage({
                        type: type,
                        ...data
                    }, '${process.env.NEXT_PUBLIC_APP_URL || "https://gestion.petit-ruban.fr"}');
                    console.log('✅ Message envoyé avec succès');
                } catch (error) {
                    console.error('❌ Erreur envoi message:', error);
                }
            } else {
                console.warn('⚠️ Pas de fenêtre parent trouvée');
            }
        }

        // Traitement des résultats
        setTimeout(() => {
            if ('${error}') {
                console.error('❌ Erreur OAuth reçue:', '${error}', '${errorDescription}');
                updateUI('error', 'Erreur d\\'autorisation', 
                    'Une erreur est survenue lors de l\\'autorisation SumUp.',
                    'Erreur: ${error}\\nDescription: ${errorDescription}'
                );
                
                sendMessageToParent('SUMUP_AUTH_ERROR', {
                    error: '${error}',
                    errorDescription: '${errorDescription}',
                    state: '${state}'
                });
                
                setTimeout(() => window.close(), 3000);
                
            } else if ('${code}') {
                console.log('✅ Code d\\'autorisation reçu:', '${code}');
                updateUI('success', 'Autorisation réussie', 
                    'Votre compte SumUp a été autorisé avec succès. Cette fenêtre va se fermer automatiquement.',
                    'Code: ${code}\\nState: ${state}'
                );
                
                sendMessageToParent('SUMUP_AUTH_SUCCESS', {
                    code: '${code}',
                    state: '${state}'
                });
                
                setTimeout(() => window.close(), 2000);
                
            } else {
                console.warn('⚠️ Aucun code ni erreur reçu');
                updateUI('error', 'Paramètres manquants', 
                    'Aucun code d\\'autorisation ou erreur n\\'a été reçu.',
                    'URL: ' + window.location.href
                );
                
                sendMessageToParent('SUMUP_AUTH_ERROR', {
                    error: 'no_code_or_error',
                    errorDescription: 'Aucun paramètre valide reçu'
                });
                
                setTimeout(() => window.close(), 5000);
            }
        }, 1000);

        // Fermeture automatique en cas de problème
        setTimeout(() => {
            console.log('⏰ Timeout - fermeture automatique');
            window.close();
        }, 30000);
    </script>
</body>
</html>`

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
  })
}
