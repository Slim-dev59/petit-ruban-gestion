# ⚡ Quick Start - Déploiement en 5 minutes

## 1️⃣ Prérequis (2 min)
- Compte Supabase gratuit: [supabase.com](https://supabase.com)
- Compte Vercel gratuit: [vercel.com](https://vercel.com)  
- Repository GitHub avec ce code

## 2️⃣ Supabase Setup (1 min)
1. Créez un projet Supabase
2. Allez dans **SQL Editor**
3. Copiez/collez: \`scripts/001_create_tables.sql\`
4. Cliquez **Run**
5. Notez votre URL et clé anon

## 3️⃣ Déployer sur Vercel (2 min)
1. Allez [vercel.com/new](https://vercel.com/new)
2. Importez votre repo GitHub
3. Ajoutez 2 variables d'env:
   - \`NEXT_PUBLIC_SUPABASE_URL\` = votre URL
   - \`NEXT_PUBLIC_SUPABASE_ANON_KEY\` = votre clé
4. Cliquez **Deploy**
5. Attendez ✅

## 4️⃣ C'est prêt! 🎉
- Votre app est en ligne
- Identifiants: admin / admin
- Vérifiez: \`https://votre-app.vercel.app/api/health\`

## Troubleshooting Rapide
\`\`\`
❌ Build échoue?
→ npm run build (localement)

❌ Pas d'accès BD?
→ Vérifiez variables env Vercel

❌ Besoin d'aide?
→ Consultez DEPLOYMENT_CHECKLIST.md
\`\`\`
`
