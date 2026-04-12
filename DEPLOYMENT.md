# ShopHub – Deployment Guide

## Step 1: Supabase (Database)

1. Go to https://supabase.com → Create account → New Project
2. In Project Settings → Database → Connection String:
   - Copy the **Transaction Pooler** URL → set as `DATABASE_URL`
   - Copy the **Direct Connection** URL → set as `DIRECT_URL`
3. In the SQL Editor, run the Prisma migration:
   ```bash
   npx prisma migrate deploy
   ```
   Or use `prisma db push` for initial setup:
   ```bash
   DATABASE_URL="your-url" npx prisma db push
   ```

## Step 2: Cloudinary (Images)

1. Go to https://cloudinary.com → Create account
2. Dashboard → Copy:
   - Cloud Name → `CLOUDINARY_CLOUD_NAME`
   - API Key → `CLOUDINARY_API_KEY`
   - API Secret → `CLOUDINARY_API_SECRET`

## Step 3: PayPal (Payments)

1. Go to https://developer.paypal.com → My Apps & Credentials
2. Create a Sandbox App → Copy:
   - Client ID → `NEXT_PUBLIC_PAYPAL_CLIENT_ID`
   - Secret → `PAYPAL_CLIENT_SECRET`
3. For live payments, create a Live App and set `PAYPAL_MODE=live`

## Step 4: Resend (Email)

1. Go to https://resend.com → Create account
2. API Keys → Create Key → `RESEND_API_KEY`
3. Add and verify your domain → `RESEND_FROM_EMAIL=noreply@yourdomain.com`

## Step 5: Google OAuth

1. Go to https://console.developers.google.com
2. Create a project → Enable Google+ API
3. OAuth 2.0 credentials → Set:
   - Authorized redirect URI: `https://yourdomain.com/api/auth/callback/google`
4. Copy Client ID → `GOOGLE_CLIENT_ID`
5. Copy Client Secret → `GOOGLE_CLIENT_SECRET`

## Step 6: Auth Secret

Generate a secure secret:
```bash
openssl rand -base64 32
```
Set as `AUTH_SECRET`

## Step 7: Deploy to Vercel

1. Push code to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/shophub.git
   git push -u origin main
   ```

2. Go to https://vercel.com → Import your GitHub repo

3. Add all Environment Variables in Vercel dashboard:
   ```
   DATABASE_URL
   DIRECT_URL
   AUTH_SECRET
   NEXTAUTH_URL=https://your-vercel-domain.vercel.app
   GOOGLE_CLIENT_ID
   GOOGLE_CLIENT_SECRET
   NEXT_PUBLIC_PAYPAL_CLIENT_ID
   PAYPAL_CLIENT_SECRET
   PAYPAL_MODE=sandbox
   CLOUDINARY_CLOUD_NAME
   CLOUDINARY_API_KEY
   CLOUDINARY_API_SECRET
   RESEND_API_KEY
   RESEND_FROM_EMAIL
   NEXT_PUBLIC_APP_URL=https://your-vercel-domain.vercel.app
   NEXT_PUBLIC_APP_NAME=ShopHub
   ```

4. Deploy!

## Step 8: Run Database Migrations on Production

After deployment, run in Vercel's CLI or locally with the production DATABASE_URL:
```bash
DATABASE_URL="your-supabase-url" npx prisma migrate deploy
```

## Step 9: Create Admin User

Run this once to make yourself an admin in Supabase SQL Editor:
```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'your@email.com';
```

## Free Tier Limits

| Service | Free Tier |
|---------|-----------|
| Vercel | 100GB bandwidth, unlimited deployments |
| Supabase | 500MB DB, 2 projects |
| Cloudinary | 25GB storage, 25GB bandwidth |
| Resend | 3,000 emails/month |
| PayPal | Free sandbox; live: ~3.49% + $0.49/transaction |
