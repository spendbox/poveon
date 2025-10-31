# Supabase Authentication Configuration

## Fix Email Confirmation Issues

Follow these steps to configure Supabase authentication properly:

### 1. Disable Email Confirmation Requirement

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **Providers** → **Email**
3. Scroll down to **Email Settings**
4. **Uncheck** "Confirm email" (disable email confirmation)
5. Click **Save**

This allows users to sign in immediately after registration without needing to confirm their email.

### 2. Fix Email Redirect URL (Localhost Issue)

1. Go to **Authentication** → **URL Configuration**
2. Find **Site URL** field
3. Update it to your production URL:
   ```
   https://your-app-name.netlify.app
   ```
4. Scroll down to **Redirect URLs**
5. Add your production URL:
   ```
   https://your-app-name.netlify.app/**
   ```
6. You can keep `http://localhost:5173/**` for local development
7. Click **Save**

### 3. Configure Email Templates (Optional)

If you want to customize confirmation emails later:

1. Go to **Authentication** → **Email Templates**
2. Select "Confirm signup" template
3. Update the redirect URL in the template to use your production domain
4. Click **Save**

### 4. Verify Settings

After making these changes:
- ✅ Users can register and sign in immediately
- ✅ Email links will point to your production URL
- ✅ No email confirmation required

## Environment Variables

Make sure these are set in Netlify:
- `VITE_SUPABASE_URL` = Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` = Your Supabase anon key

## Testing

1. Deploy to Netlify after configuring Supabase
2. Try registering a new account
3. You should be signed in immediately after registration
4. No email confirmation needed
