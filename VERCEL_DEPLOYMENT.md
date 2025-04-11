# Vercel Deployment Guide

This guide will help you deploy your full-stack application to Vercel, including both frontend and serverless backend.

## Prerequisites

1. A [Vercel account](https://vercel.com/signup)
2. A [GitHub account](https://github.com/signup) (recommended)
3. A PostgreSQL database (e.g., Supabase, Neon, or any other Postgres provider)

## Step 1: Prepare Your Repository

1. Make sure your code is pushed to a GitHub repository
2. Ensure your `.env` file is not committed to GitHub (it should be in `.gitignore`)

## Step 2: Set Up Your Database

1. If you don't have a database yet:
   - Sign up for [Supabase](https://supabase.com/) (recommended)
   - Create a new project
   - Get your database connection string from the "Settings" > "Database" section

2. Make note of your database connection string, it will look like:
   `postgresql://postgres:password@db.example.supabase.co:5432/postgres`

## Step 3: Deploy to Vercel

1. Log in to [Vercel](https://vercel.com/)
2. Click "New Project"
3. Import your GitHub repository
4. Configure your project:
   - Framework Preset: Vite
   - Build Command: `npm run vercel-build`
   - Output Directory: `dist`
   - Install Command: `npm install`

5. Add Environment Variables:
   - `DATABASE_URL` - Your PostgreSQL connection string
   - `VITE_SUPABASE_URL` - Your Supabase URL (if using Supabase Auth)
   - `VITE_SUPABASE_ANON_KEY` - Your Supabase anon key (if using Supabase Auth)
   - `VITE_JWT_SECRET` - Your JWT secret key for authentication
   - Any other environment variables in your `.env` file

6. Click "Deploy"

## Step 4: Verify Deployment

Once deployed:
1. Test your frontend by visiting your Vercel URL
2. Test your API by visiting `https://your-vercel-url.vercel.app/api/health`

## Troubleshooting

If you encounter issues:

1. **Database connection errors**:
   - Check your `DATABASE_URL` environment variable
   - Ensure your database allows connections from Vercel's IP ranges
   - For Supabase: Go to "Database" > "Connection Pooling" and enable it

2. **API errors**:
   - Check Vercel's Function Logs in the "Functions" tab
   - Ensure your serverless function isn't exceeding 10 seconds (Vercel's limit)

3. **Build errors**:
   - Check Vercel's build logs
   - Make sure all dependencies are properly installed

## Keeping Secrets Secure

Never commit your `.env` file to your repository. Always use Vercel's Environment Variables feature for:
- Database credentials
- API keys
- Auth secrets

## Updating Your Deployment

Any changes pushed to your main branch will automatically trigger a new deployment on Vercel.

## Custom Domains

To use your own domain:
1. Go to your Vercel project
2. Click "Settings" > "Domains"
3. Add your domain and follow the instructions 