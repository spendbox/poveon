# QuickPost Deployment Guide for Netlify

This guide will help you deploy QuickPost to Netlify successfully and ensure the onboarding flow works properly.

## Prerequisites

1. A [Netlify account](https://app.netlify.com/signup)
2. A [Google Gemini API key](https://aistudio.google.com/app/apikey)
3. Your code repository (GitHub, GitLab, or Bitbucket)

## Quick Deployment Steps

### Option 1: Deploy via Netlify Dashboard (Recommended)

1. **Connect Your Repository**
   - Log into [Netlify](https://app.netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Select your Git provider and authorize Netlify
   - Choose the `poveon` repository

2. **Configure Build Settings**

   Netlify will automatically detect the settings from `netlify.toml`, but verify:

   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Node version**: 20

3. **Set Environment Variables** ⚠️ **CRITICAL STEP**

   Go to "Site configuration" → "Environment variables" and add:

   ```
   Key: GEMINI_API_KEY
   Value: [Your actual Gemini API key]
   ```

   **Without this, the AI features and onboarding will fail!**

4. **Deploy**
   - Click "Deploy site"
   - Wait for the build to complete (usually 1-2 minutes)
   - Your site will be live at `https://[random-name].netlify.app`

### Option 2: Deploy via Netlify CLI

```bash
# Install Netlify CLI globally
npm install -g netlify-cli

# Login to Netlify
netlify login

# Initialize site
netlify init

# Set environment variable
netlify env:set GEMINI_API_KEY "your_gemini_api_key_here"

# Deploy
netlify deploy --prod
```

## Environment Variables Explained

### Required Variables

| Variable | Description | Where to Get It |
|----------|-------------|-----------------|
| `GEMINI_API_KEY` | Google Gemini API key for AI features | [Get API Key](https://aistudio.google.com/app/apikey) |

### How It Works

In `vite.config.ts`, the environment variable is mapped:
```typescript
define: {
  'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
}
```

This means:
- You set `GEMINI_API_KEY` in Netlify
- It becomes `process.env.API_KEY` in your app
- The AI features in `App.tsx` can access it

## Troubleshooting Common Issues

### Issue 1: "AI features not working" or "API key is missing"

**Cause**: `GEMINI_API_KEY` environment variable not set in Netlify

**Solution**:
1. Go to your Netlify site dashboard
2. Navigate to "Site configuration" → "Environment variables"
3. Add `GEMINI_API_KEY` with your actual API key
4. Trigger a new deploy: "Deploys" → "Trigger deploy" → "Clear cache and deploy site"

### Issue 2: "404 Not Found" when refreshing page

**Cause**: SPA routing not properly configured

**Solution**:
- This is already fixed in `netlify.toml` with the redirect rule:
  ```toml
  [[redirects]]
    from = "/*"
    to = "/index.html"
    status = 200
  ```
- If still happening, verify `netlify.toml` is in your repository root

### Issue 3: "Onboarding flow stops working" / Modal doesn't appear

**Possible causes**:
1. **JavaScript errors** - Check browser console (F12)
2. **Environment variable missing** - Verify `GEMINI_API_KEY` is set
3. **CSP blocking external scripts** - Already handled in `netlify.toml`
4. **localStorage issues** - Clear browser data and try again

**Debug steps**:
```bash
# Test locally first
npm install
GEMINI_API_KEY=your_key npm run dev

# Check if onboarding works locally
# Open http://localhost:3000
# Try to create a request (should prompt for login/register)
```

### Issue 4: Build fails on Netlify

**Common causes**:
- Node version mismatch
- Missing dependencies
- TypeScript errors

**Solution**:
```bash
# Test build locally first
npm install
GEMINI_API_KEY=test npm run build

# If successful locally but fails on Netlify:
# 1. Check Node version in netlify.toml (should be 20)
# 2. Clear Netlify build cache: Deploys → Clear cache and retry deploy
```

### Issue 5: Blank page after deployment

**Causes**:
- Build directory wrong
- Missing environment variables
- JavaScript runtime errors

**Debug steps**:
1. Check Netlify deploy logs for errors
2. Verify publish directory is `dist`
3. Check browser console for errors (F12)
4. Verify environment variables are set

## Netlify Configuration Explained

The `netlify.toml` file includes:

### ✅ SPA Routing
```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```
Ensures React Router works on page refresh

### ✅ Security Headers
- X-Frame-Options: Prevents clickjacking
- X-Content-Type-Options: Prevents MIME sniffing
- CSP: Allows Tailwind CDN, Gemini API, and import maps

### ✅ Performance Optimization
- Aggressive caching for static assets (1 year)
- Proper MIME types for ES modules
- CSS/JS minification

### ✅ Build Settings
- Node 20
- Production/development contexts
- Lighthouse CI for monitoring

## Testing Your Deployment

### 1. Basic Functionality Test
- [ ] Site loads without errors
- [ ] Can type in the request input field
- [ ] AI generates request details when you type and press enter
- [ ] Login/Register modal appears when trying to post
- [ ] Can create an account
- [ ] Can post a request after authentication
- [ ] Can view wallet balance
- [ ] Can filter and sort requests

### 2. Onboarding Flow Test
- [ ] Landing page displays correctly
- [ ] Typing a request triggers AI processing
- [ ] Unauthenticated users see login/register modal
- [ ] Can register with name, email, password
- [ ] After registration, can complete request posting
- [ ] Welcome toast appears after login
- [ ] User sees initial wallet balance (1000 NGN for new users)

### 3. Browser Compatibility
Test in:
- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile browsers (iOS Safari, Chrome Android)

### 4. Performance Check
- Open browser DevTools → Network tab
- Reload page
- Verify:
  - [ ] Page loads in < 3 seconds
  - [ ] Import maps load from CDN
  - [ ] No 404 errors for resources
  - [ ] Tailwind CSS loads properly

## Monitoring and Maintenance

### View Deploy Logs
1. Go to your site in Netlify dashboard
2. Click "Deploys"
3. Click on any deploy to see detailed logs

### View Runtime Logs
Netlify doesn't have runtime logs for static sites, but you can:
- Use browser DevTools console
- Add error tracking (e.g., Sentry) if needed

### Update Environment Variables
1. Site dashboard → "Site configuration" → "Environment variables"
2. Edit or add new variables
3. Trigger a new deploy for changes to take effect

### Custom Domain Setup
1. Site dashboard → "Domain management"
2. Add custom domain
3. Follow Netlify's DNS configuration instructions
4. SSL certificate is automatically provisioned

## Performance Tips

1. **Enable Netlify Analytics** (optional, paid feature)
   - Real user monitoring
   - Traffic insights

2. **Use Netlify CDN** (automatic)
   - Your site is served from global edge locations
   - Automatically enabled

3. **Monitor Lighthouse Scores**
   - The `netlify.toml` includes Lighthouse plugin
   - View scores in deploy logs

## Security Best Practices

1. **Never commit API keys**
   - `.env.local` is gitignored
   - Use Netlify environment variables

2. **Keep dependencies updated**
   ```bash
   npm outdated
   npm update
   ```

3. **Monitor for vulnerabilities**
   ```bash
   npm audit
   npm audit fix
   ```

## Rollback Instructions

If a deployment breaks your site:

1. Go to "Deploys" in Netlify dashboard
2. Find the last working deploy
3. Click "..." → "Publish deploy"
4. Your site instantly reverts to that version

## Getting Help

### Netlify Support
- [Documentation](https://docs.netlify.com)
- [Community Forums](https://answers.netlify.com)
- [Support](https://www.netlify.com/support)

### QuickPost Issues
If the onboarding flow is broken:
1. Check browser console for errors
2. Verify `GEMINI_API_KEY` is set correctly
3. Clear browser localStorage: `localStorage.clear()` in console
4. Try incognito/private browsing mode

## Advanced Configuration

### Branch Deploys
- Every branch gets a unique URL
- Perfect for testing features
- Configured in `netlify.toml`:
  ```toml
  [context.branch-deploy]
    command = "npm run build"
  ```

### Deploy Previews
- Every pull request gets a preview URL
- Test changes before merging
- Automatically created

### Serverless Functions (Future Enhancement)
If you want to add backend functionality:
1. Create `netlify/functions/` directory
2. Add function files
3. Deploy - Netlify handles the rest

## Checklist for First Deployment

Before you deploy:
- [ ] Code is pushed to Git repository
- [ ] `netlify.toml` is in repository root
- [ ] `.env.example` documents required variables
- [ ] You have a Gemini API key ready

During deployment:
- [ ] Repository connected to Netlify
- [ ] Build settings verified
- [ ] `GEMINI_API_KEY` environment variable set
- [ ] Initial deploy successful

After deployment:
- [ ] Site loads correctly
- [ ] Can create a request (tests AI)
- [ ] Can register/login
- [ ] Can post a request
- [ ] Tested on mobile
- [ ] Custom domain configured (optional)

---

## Need Help?

If you encounter issues not covered here, check:
1. Browser console (F12) for errors
2. Netlify deploy logs
3. Netlify status page: https://www.netlifystatus.com

Happy deploying! 🚀
