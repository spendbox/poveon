# Supabase Setup Guide for Poveon

This guide will walk you through setting up Supabase as the backend for Poveon.

## Overview

Supabase provides:
- **PostgreSQL Database** - Store users, requests, applications, and transactions
- **Authentication** - Built-in user authentication
- **Real-time** - Live updates for new requests and applications
- **Row Level Security** - Secure data access policies
- **RESTful API** - Auto-generated API from your database schema

## Step 1: Create a Supabase Account

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign up with GitHub, Google, or email

## Step 2: Create a New Project

1. Click "New Project" in your Supabase dashboard
2. Fill in the project details:
   - **Name**: `poveon` (or any name you prefer)
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose the closest region to your users
   - **Pricing Plan**: Select "Free" (sufficient for development and small-scale production)
3. Click "Create new project"
4. Wait 2-3 minutes for the project to be provisioned

## Step 3: Get Your API Credentials

1. In your Supabase project dashboard, go to **Settings** (gear icon)
2. Click on **API** in the left sidebar
3. You'll see two important values:
   - **Project URL**: `https://xxxxxxxxxxxxx.supabase.co`
   - **anon/public key**: `eyJhbGc...` (long string)
4. **Copy these values** - you'll need them in Step 5

## Step 4: Set Up the Database Schema

1. In your Supabase dashboard, click **SQL Editor** in the left sidebar
2. Click **New Query**
3. Open the `database-schema.sql` file from your project root
4. **Copy all the SQL** from `database-schema.sql`
5. **Paste it** into the SQL Editor in Supabase
6. Click **Run** (or press Cmd/Ctrl + Enter)
7. You should see "Success. No rows returned" - this is normal!

This creates:
- ✅ `users` table (extends Supabase Auth)
- ✅ `requests` table
- ✅ `applications` table
- ✅ `transactions` table
- ✅ Indexes for performance
- ✅ Row Level Security policies
- ✅ Triggers for automatic timestamps
- ✅ Function to auto-create user profiles on signup

## Step 5: Configure Environment Variables

### For Local Development:

1. Copy the `.env.example` file:
   ```bash
   cp .env.example .env.local
   ```

2. Open `.env.local` and fill in your credentials:
   ```
   GEMINI_API_KEY=your_gemini_api_key
   SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
   SUPABASE_ANON_KEY=eyJhbGc...your_anon_key
   ```

3. Save the file

### For Netlify Deployment:

1. Go to your Netlify dashboard
2. Navigate to: **Site settings > Environment variables**
3. Add these three variables:
   - `GEMINI_API_KEY` = your Gemini API key
   - `SUPABASE_URL` = your Supabase project URL
   - `SUPABASE_ANON_KEY` = your Supabase anon key
4. Click **Save**
5. Trigger a new deploy

## Step 6: Test the Database Connection

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Open your browser to `http://localhost:3000`

3. Try these actions:
   - **Register a new account** - This should create a user in Supabase
   - **Create a request** - This should save to the database
   - **View requests** - Should load from Supabase instead of localStorage

## Step 7: Verify Data in Supabase

1. In your Supabase dashboard, click **Table Editor**
2. You should see your tables on the left:
   - `users`
   - `requests`
   - `applications`
   - `transactions`
3. Click on `users` - you should see your test user
4. Click on `requests` - you should see any requests you created

## Step 8: Enable Authentication Providers (Optional)

By default, Supabase supports email/password authentication. You can add more providers:

1. Go to **Authentication > Providers** in your Supabase dashboard
2. Enable any providers you want:
   - Google OAuth
   - GitHub OAuth
   - Facebook
   - etc.
3. Follow the setup instructions for each provider

## Step 9: Set Up Email Templates (Optional)

Customize the emails Supabase sends:

1. Go to **Authentication > Email Templates**
2. Customize:
   - **Confirm signup** - Email verification
   - **Magic Link** - Passwordless login
   - **Change Email Address** - Email change confirmation
   - **Reset Password** - Password reset

## Common Issues & Troubleshooting

### "Failed to fetch" or Connection Errors

- ✅ Check that your `SUPABASE_URL` and `SUPABASE_ANON_KEY` are correct
- ✅ Make sure you ran the database schema SQL
- ✅ Check that RLS (Row Level Security) is enabled on tables
- ✅ Verify your Supabase project is running (not paused)

### "Failed to create user" or Auth Errors

- ✅ Check that the trigger `on_auth_user_created` was created successfully
- ✅ Verify the `users` table exists
- ✅ Try running the schema SQL again

### "Insufficient privileges" Errors

- ✅ Check that RLS policies are set up correctly
- ✅ Make sure you're using the `anon` key, not the `service_role` key
- ✅ Verify the user is authenticated before making requests

### Data Not Showing Up

- ✅ Check the browser console for errors
- ✅ Verify data exists in Supabase Table Editor
- ✅ Check network tab to see API requests/responses
- ✅ Ensure RLS policies allow SELECT operations

## Database Schema Overview

```
┌─────────────┐
│   auth.users│  (Managed by Supabase)
└──────┬──────┘
       │
       │ 1:1
       ▼
┌─────────────┐     1:N     ┌──────────────┐
│   users     ├────────────►│  requests    │
└─────────────┘             └──────┬───────┘
       │                           │
       │ 1:N                       │ 1:N
       ▼                           ▼
┌─────────────┐             ┌──────────────┐
│transactions │             │ applications │
└─────────────┘             └──────────────┘
```

## Monitoring & Analytics

### View Logs

1. Go to **Logs** in your Supabase dashboard
2. Select log type:
   - **API Logs** - See all API requests
   - **Function Logs** - See function executions
   - **Auth Logs** - See authentication events

### Monitor Database

1. Go to **Database > Indexes** - Check query performance
2. Go to **Database > Roles** - Manage database permissions
3. Use **Reports** to see usage statistics

## Security Best Practices

1. ✅ **Never commit** `.env.local` to git (it's in `.gitignore`)
2. ✅ **Never expose** your `service_role` key (use `anon` key only)
3. ✅ **Always use RLS** policies to protect data
4. ✅ **Validate input** on the frontend before saving to database
5. ✅ **Use transactions** for operations that modify multiple tables
6. ✅ **Regularly backup** your database (Supabase does this automatically on paid plans)

## Scaling & Limits

### Free Tier Limits:
- **Database size**: 500 MB
- **Bandwidth**: 5 GB
- **API requests**: 500 requests per second
- **Auth users**: 50,000 Monthly Active Users
- **File storage**: 1 GB

### When to Upgrade:
- If you exceed these limits
- If you need daily backups
- If you need custom domain for auth
- If you need priority support

## Next Steps

✅ Complete the Supabase setup above
✅ Test user registration and login
✅ Create some test requests
✅ Test the wallet functionality
✅ Deploy to Netlify with environment variables
✅ Set up Paystack integration for real payments

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Community Discord](https://discord.supabase.com)

## Need Help?

If you run into issues:
1. Check the Supabase logs
2. Review the database schema
3. Check the browser console for errors
4. Verify environment variables are set correctly
5. Consult the Supabase documentation
