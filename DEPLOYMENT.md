# Deployment Guide - Boutique Multi-Créateurs

## Prerequisites

- Supabase project set up
- Vercel account
- GitHub repository connected

## Environment Variables

Copy `.env.example` to `.env.local` and fill in your Supabase credentials:

\`\`\`
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
\`\`\`

## Database Setup

1. Go to your Supabase project SQL editor
2. Copy and run the contents of `scripts/001_create_tables.sql`
3. Verify all tables are created

## Local Testing

\`\`\`bash
npm install
npm run dev
\`\`\`

Visit `http://localhost:3000` and test the app.

## Deploy to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and import your repository
3. Add environment variables from `.env.example`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Click Deploy

## Health Check

After deployment, verify the app is working:

\`\`\`
https://your-deployed-app.vercel.app/api/health
\`\`\`

Should return:
\`\`\`json
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "2025-01-15T10:30:00.000Z"
}
\`\`\`

## Troubleshooting

### Database Connection Issues
- Verify environment variables are set correctly in Vercel
- Check Supabase project is active
- Ensure RLS policies allow access

### Build Failures
- Check `next build` runs locally without errors
- Verify all imports are correct
- Check TypeScript errors: `npm run build`

### Runtime Errors
- Check Vercel logs: `vercel logs`
- Monitor Supabase SQL editor for query errors
- Check browser console for client-side errors
