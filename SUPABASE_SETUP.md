# Poveon - Supabase Integration Setup Guide

## 🚀 Quick Setup (15 minutes)

### 1. Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project"
3. Create a new organization (if needed)
4. Click "New Project"
5. Fill in:
   - **Name**: Poveon
   - **Database Password**: (create a strong password - save it!)
   - **Region**: Choose closest to your users
6. Click "Create new project"
7. Wait 2-3 minutes for setup

### 2. Run Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New query"
3. Copy the entire contents of `supabase-schema.sql`
4. Paste into the SQL Editor
5. Click "Run" (or press Cmd/Ctrl + Enter)
6. You should see "Success. No rows returned"

### 3. Get Your Supabase Credentials

1. In Supabase dashboard, go to **Settings** → **API**
2. Copy these two values:
   - **Project URL** (starts with https://xxx.supabase.co)
   - **anon/public key** (long string starting with eyJ...)

### 4. Set Environment Variables

#### For Local Development:

Create `.env.local` file in project root:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Google Gemini API (for AI features)
GEMINI_API_KEY=your-gemini-api-key-here
```

#### For Netlify Deployment:

1. Go to your Netlify dashboard
2. Select your site → **Site configuration** → **Environment variables**
3. Add these variables:
   ```
   VITE_SUPABASE_URL = https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY = your-anon-key-here
   GEMINI_API_KEY = your-gemini-api-key-here
   ```
4. Click "Save"
5. Trigger a new deploy: **Deploys** → **Trigger deploy**

### 5. Enable Email Auth in Supabase

1. Go to **Authentication** → **Providers**
2. Make sure **Email** is enabled
3. Configure email templates (optional):
   - Go to **Authentication** → **Email Templates**
   - Customize signup/reset emails with Poveon branding

### 6. Test the Integration

Run locally:
```bash
npm install
npm run dev
```

Visit http://localhost:3000 and:
1. ✅ Register a new account
2. ✅ Check your email for confirmation
3. ✅ Log in
4. ✅ Create a request
5. ✅ Check Supabase dashboard → **Table Editor** to see data

---

## 📊 Database Schema Overview

### Tables:

1. **users** - User profiles (extends Supabase Auth)
   - id, email, name, phone, bio, location
   - wallet_balance (starts at 1000 NGN)
   - verification_status

2. **requests** - Service requests
   - id, user_id, title, description, category
   - budget, urgency, whatsapp, email
   - timestamps

3. **applications** - User applications to requests
   - id, request_id, user_id, applied_at

4. **unlocked_requests** - Tracks which users unlocked which requests
   - id, user_id, request_id, unlocked_at

### Security:

- ✅ Row Level Security (RLS) enabled on all tables
- ✅ Users can only edit their own data
- ✅ Anyone can view requests (public marketplace)
- ✅ Only request owners see applicants

---

## 🔄 Migration from LocalStorage

The code now uses Supabase instead of localStorage:

**Before (LocalStorage):**
- Data stored in browser only
- Lost on clear cache
- No sync across devices
- Mock authentication

**After (Supabase):**
- Real database
- Persistent across devices
- Real authentication
- Secure data storage

---

## 🎨 Branding Changes

- ✅ "QuickPost" → "Poveon" everywhere
- ✅ Updated page title
- ✅ Updated meta descriptions
- ✅ Configured for service marketplace

---

## 🔐 Authentication Flow

1. **Sign Up**: Creates auth.users record + public.users profile
2. **Login**: Uses Supabase Auth
3. **Session**: Managed by Supabase (auto-refresh)
4. **Logout**: Clears session

---

## 💳 Wallet & Payments (Paystack Integration - Next Step)

Current Setup:
- Users start with 1000 NGN in wallet
- Wallet stored in Supabase database
- Deductions tracked in database

To Add Paystack:
1. Install Paystack library
2. Add payment gateway component
3. Create Supabase function to add funds
4. Webhook to verify payments

---

## 🛠️ Troubleshooting

### "Invalid API key" error:
- Check `.env.local` has correct Supabase credentials
- Restart dev server after adding env vars
- Make sure using `VITE_` prefix for Vite to recognize

### "Failed to fetch" errors:
- Check Supabase project is running (not paused)
- Verify RLS policies are set up correctly
- Check browser console for specific errors

### Email confirmation not working:
- Check Supabase **Authentication** → **URL Configuration**
- Set **Site URL** to your production URL
- For local dev, add `http://localhost:3000` to **Redirect URLs**

### Can't see data in tables:
- Go to Supabase **Table Editor**
- Check RLS policies allow your user to read data
- Try disabling RLS temporarily to debug (re-enable after!)

---

## 📚 Useful Supabase Features

### Realtime Subscriptions (Optional Enhancement):

```typescript
// Subscribe to new requests in real-time
const subscription = supabase
  .channel('requests')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'requests'
  }, (payload) => {
    console.log('New request:', payload.new);
  })
  .subscribe();
```

### Storage (For future: profile pictures, request attachments):

1. Go to **Storage** in Supabase dashboard
2. Create bucket: `avatars` or `attachments`
3. Set up RLS policies for uploads
4. Use `supabase.storage.from('avatars').upload()`

---

## 🚀 Next Steps

1. ✅ Set up Supabase (this guide)
2. ⏭️ Integrate Paystack for payments
3. ⏭️ Add email notifications
4. ⏭️ Add profile pictures with Supabase Storage
5. ⏭️ Add realtime features (live notifications)
6. ⏭️ Add admin panel

---

## 📞 Need Help?

- **Supabase Docs**: https://supabase.com/docs
- **Poveon GitHub Issues**: [Create an issue]
- **Supabase Discord**: https://discord.supabase.com

---

**Happy Building! 🎉**
