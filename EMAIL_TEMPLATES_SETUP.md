# Email Templates Setup Guide

This guide will help you apply the custom email templates to your Supabase project.

## Overview

We've created 4 professional, branded email templates for Poveon:

1. **Confirm Signup** - Email verification for new users
2. **Reset Password** - Password reset requests
3. **Magic Link** - Passwordless login
4. **Change Email** - Email address change confirmation

All templates are:
- ✅ Mobile-responsive
- ✅ Branded with Poveon colors and logo
- ✅ Professional and modern design
- ✅ Include security notices
- ✅ Tested across major email clients

---

## Step-by-Step Setup

### Step 1: Access Email Templates in Supabase

1. Log in to your [Supabase Dashboard](https://app.supabase.com)
2. Select your **Poveon** project
3. Click on **Authentication** in the left sidebar (🔐 icon)
4. Click on **Email Templates**

You'll see a list of template types on the left.

---

### Step 2: Apply Confirm Signup Template

This is the most important template - it's sent when users register.

1. **Click on "Confirm signup"** in the left menu
2. **Delete the existing HTML** in the editor
3. **Open** `email-templates/confirm-signup.html` from your project
4. **Copy ALL the HTML code** (Ctrl+A, then Ctrl+C)
5. **Paste** it into the Supabase editor
6. **Click "Save"** (top right)

**Test it:**
- Scroll down and click **"Send test email"**
- Check your inbox - you should receive a beautifully formatted email!

---

### Step 3: Apply Reset Password Template

1. **Click on "Reset Password"** in the left menu
2. **Delete the existing HTML**
3. **Open** `email-templates/reset-password.html`
4. **Copy ALL the HTML code**
5. **Paste** into Supabase editor
6. **Click "Save"**

**Test it:**
- Try the "Forgot Password" feature on your app
- Check the email format

---

### Step 4: Apply Magic Link Template

1. **Click on "Magic Link"** in the left menu
2. **Delete the existing HTML**
3. **Open** `email-templates/magic-link.html`
4. **Copy ALL the HTML code**
5. **Paste** into Supabase editor
6. **Click "Save"**

**Note:** Magic Link is for passwordless authentication. You can enable this later if needed.

---

### Step 5: Apply Change Email Template

1. **Click on "Change Email Address"** in the left menu
2. **Delete the existing HTML**
3. **Open** `email-templates/change-email.html`
4. **Copy ALL the HTML code**
5. **Paste** into Supabase editor
6. **Click "Save"**

---

## Customization Options

### Change Colors

To match your brand better, you can customize the colors in the templates:

**Header Gradient:**
```html
<!-- Current: Dark slate gradient -->
<td style="background: linear-gradient(135deg, #1e293b 0%, #334155 100%); ...">

<!-- Change to your brand colors -->
<td style="background: linear-gradient(135deg, #YOUR_COLOR_1 0%, #YOUR_COLOR_2 100%); ...">
```

**Button Color:**
```html
<!-- Current: Dark slate -->
<a href="..." style="... background-color: #1e293b; ...">

<!-- Change to your brand color -->
<a href="..." style="... background-color: #YOUR_COLOR; ...">
```

### Add Logo Image

To add your logo instead of text:

**Replace this:**
```html
<h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">
    Poveon
</h1>
```

**With this:**
```html
<img src="https://your-domain.com/logo-white.png"
     alt="Poveon"
     width="180"
     height="auto"
     style="display: block; margin: 0 auto;">
```

### Add Social Media Links

Uncomment the social links section in the footer:

```html
<!-- Find this in the footer -->
<!-- Social Links (Optional - uncomment when you have them) -->
<!--
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
    ...
</table>
-->

<!-- Remove the comment tags and add your links -->
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
    <tr>
        <td align="center" style="padding: 8px 0 0 0;">
            <a href="https://twitter.com/yourhandle" style="display: inline-block; margin: 0 8px;">
                <!-- Add Twitter icon or emoji -->
            </a>
        </td>
    </tr>
</table>
```

---

## Available Template Variables

Supabase provides these variables you can use in templates:

| Variable | Description | Available In |
|----------|-------------|--------------|
| `{{ .Email }}` | User's email address | All templates |
| `{{ .ConfirmationURL }}` | Verification/action link | All templates |
| `{{ .SiteURL }}` | Your app URL | All templates |
| `{{ .TokenHash }}` | Token for manual verification | All templates |
| `{{ .Token }}` | Short verification code | All templates (if enabled) |

**These are already included in the templates!**

---

## Configure Site URL

Important: Make sure your Site URL is set correctly in Supabase:

1. Go to **Authentication** → **URL Configuration**
2. Set **Site URL** to your deployed Netlify URL:
   ```
   https://your-app-name.netlify.app
   ```
3. Add **Redirect URLs** (if needed):
   ```
   https://your-app-name.netlify.app/**
   ```

This ensures verification links redirect to your app correctly.

---

## Testing Your Templates

### Test Email Delivery:

1. **In each template**, scroll down to find **"Send test email"**
2. Enter your email address
3. Click **"Send test email"**
4. Check your inbox (and spam folder)

### Test Real Workflow:

1. **Registration:**
   - Register a new account on your app
   - Check email formatting
   - Click verification link
   - Verify it works

2. **Password Reset:**
   - Use "Forgot Password" on your app
   - Check email formatting
   - Click reset link
   - Try resetting password

3. **Check Mobile:**
   - Forward test emails to your phone
   - Verify they look good on mobile

---

## Troubleshooting

### Emails Going to Spam

**Solutions:**
1. ✅ You've already set up Resend SMTP (good!)
2. Verify your domain in Resend (improves deliverability)
3. Ask recipients to mark as "Not Spam"
4. Check SPF/DKIM records are set up in Resend

### Template Variables Not Working

Make sure you're using the correct syntax:
- ✅ Correct: `{{ .ConfirmationURL }}`
- ❌ Wrong: `{{.ConfirmationURL}}` (needs spaces)
- ❌ Wrong: `{{ ConfirmationURL }}` (needs the dot)

### Styling Looks Broken

Some email clients have limitations:
- Gmail: Removes `<style>` tags in `<head>` (we use inline styles)
- Outlook: Limited CSS support (templates are compatible)
- Test in multiple clients: Gmail, Outlook, Apple Mail

### Links Not Working

1. Check **Site URL** is set correctly in Supabase
2. Verify **Redirect URLs** include your domain
3. Make sure Netlify deployment is live
4. Check links aren't blocked by email client

---

## Email Best Practices

### For Better Deliverability:

1. **Use Resend custom domain:**
   - Verify your domain in Resend
   - Use `noreply@yourdomain.com` as sender

2. **Keep consistent sender info:**
   - Always use same sender name and email
   - Helps build sender reputation

3. **Monitor metrics:**
   - Check Resend dashboard for delivery rates
   - Watch for bounces and spam reports

4. **Avoid spam triggers:**
   - Don't use all caps
   - Avoid excessive exclamation marks!!!
   - Don't use words like "FREE", "WINNER", etc.

---

## Advanced: A/B Testing Templates

To test which template performs better:

1. Create a variant of a template
2. Use for 50% of users
3. Track:
   - Open rates
   - Click rates (verification links)
   - Conversion rates

**Note:** This requires custom analytics setup

---

## Template Maintenance

### When to Update Templates:

- ✅ Rebranding (logo, colors change)
- ✅ New features to highlight
- ✅ Legal requirements (privacy policy links)
- ✅ Seasonal campaigns
- ✅ Improving conversion rates

### Version Control:

- Keep template files in git (already done!)
- Document changes in commit messages
- Test thoroughly before applying to production

---

## Email Metrics to Track

Monitor these in Resend dashboard:

- **Delivery Rate:** Should be >99%
- **Open Rate:** Industry average ~20-30%
- **Click Rate:** Verification emails typically 40-60%
- **Bounce Rate:** Should be <2%
- **Spam Complaints:** Should be <0.1%

---

## Quick Reference

### Template File Locations:

```
email-templates/
├── confirm-signup.html    → Email verification
├── reset-password.html    → Password reset
├── magic-link.html        → Passwordless login
└── change-email.html      → Email change confirmation
```

### Supabase Location:

```
Dashboard → Authentication → Email Templates
```

### Apply Changes Workflow:

1. Edit HTML file locally
2. Copy entire file
3. Paste into Supabase template editor
4. Save
5. Test with "Send test email"
6. Commit changes to git

---

## Next Steps

After applying all templates:

1. ✅ **Test all templates** - Use "Send test email" for each
2. ✅ **Test real flows** - Register, reset password, etc.
3. ✅ **Check mobile** - Forward emails to phone
4. ✅ **Monitor deliverability** - Check Resend dashboard
5. ✅ **Gather feedback** - Ask users about email experience

---

## Support

If you encounter issues:

1. **Check Supabase Logs:**
   - Dashboard → Logs → Auth Logs
   - Look for email-related errors

2. **Check Resend Logs:**
   - Resend Dashboard → Logs
   - See delivery status

3. **Test SMTP Connection:**
   - Authentication → SMTP Settings
   - Click "Test SMTP configuration"

4. **Common Issues:**
   - Rate limits: Upgrade Resend plan if needed
   - Spam: Verify domain in Resend
   - Variables: Check syntax `{{ .Variable }}`

---

## Summary Checklist

- [ ] Opened Supabase Email Templates
- [ ] Applied Confirm Signup template
- [ ] Applied Reset Password template
- [ ] Applied Magic Link template
- [ ] Applied Change Email template
- [ ] Tested all templates with "Send test email"
- [ ] Verified Site URL is correct
- [ ] Tested real registration flow
- [ ] Tested password reset flow
- [ ] Checked emails on mobile device
- [ ] Customized colors/branding (optional)
- [ ] Added logo image (optional)
- [ ] Committed templates to git

---

🎉 **You're all set!** Your users will now receive professional, branded emails for all authentication flows.
