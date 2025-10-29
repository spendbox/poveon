# Enable Email Verification in Supabase

Before deploying the updated app, you need to enable email verification in your Supabase project.

## Steps:

1. **Go to your Supabase Dashboard**
   - Navigate to [https://app.supabase.com](https://app.supabase.com)
   - Select your `poveon` project

2. **Open Authentication Settings**
   - Click on **Authentication** in the left sidebar (🔐 icon)
   - Click on **Providers**

3. **Configure Email Provider**
   - Find **Email** in the providers list
   - Make sure it's **Enabled** (toggle should be green)
   - Click on **Email** to expand settings

4. **Enable Email Confirmation**
   - Scroll down to find **"Confirm email"** setting
   - **Toggle it ON** (enable)
   - This requires users to verify their email before they can sign in

5. **Session Settings (Optional but Recommended)**
   - Click on **Settings** under Authentication section
   - Find **"Session timeout"**
   - Set to a high value like `2592000` seconds (30 days) for persistent sessions
   - Or leave default - sessions will persist until manual logout regardless

6. **Email Templates (Optional - Customize Later)**
   - Under Authentication > Email Templates
   - You can customize the verification email
   - Default template works fine for now

7. **Save Changes**
   - Changes are saved automatically
   - No deploy needed

## What This Does:

- ✅ New users MUST click verification link in email before they can log in
- ✅ Prevents spam/fake accounts
- ✅ Users can only access the app with verified emails
- ✅ Sessions persist across browser restarts until user manually logs out

## Testing Email Verification:

After you enable this:
1. Register a new account with your email
2. Check your email inbox for verification link
3. Click the link to verify
4. Now you can log in and use the app

**Note:** During development, you can check the Supabase logs to see the verification emails if they're not being delivered.
