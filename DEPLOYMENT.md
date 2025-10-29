# Deployment Guide - Netlify

This guide explains how to deploy the Poveon application to Netlify.

## Prerequisites

- A [Netlify account](https://app.netlify.com/signup) (free tier available)
- A [Supabase account](https://supabase.com) with a configured project (see [SUPABASE_SETUP.md](SUPABASE_SETUP.md))
- A [Gemini API key](https://aistudio.google.com/app/apikey)
- This repository pushed to GitHub, GitLab, or Bitbucket

## Deployment Methods

### Method 1: Deploy via Netlify UI (Recommended for first deployment)

1. **Connect your repository:**
   - Log in to [Netlify](https://app.netlify.com)
   - Click "Add new site" > "Import an existing project"
   - Choose your Git provider and authorize Netlify
   - Select this repository

2. **Configure build settings:**
   - Netlify should auto-detect the settings from `netlify.toml`, but verify:
     - **Build command:** `npm run build`
     - **Publish directory:** `dist`
   - Click "Deploy site"

3. **Set environment variables:**
   - Go to Site settings > Environment variables
   - Add the following variables:
     - **Key:** `GEMINI_API_KEY` | **Value:** Your Gemini API key ([Get key](https://aistudio.google.com/app/apikey))
     - **Key:** `SUPABASE_URL` | **Value:** Your Supabase project URL
     - **Key:** `SUPABASE_ANON_KEY` | **Value:** Your Supabase anon/public key
   - Get Supabase credentials from: Project Settings > API in your Supabase dashboard
   - Note: The Vite config makes these variables available to the application

4. **Redeploy if needed:**
   - After adding environment variables, trigger a new deploy from the Deploys tab
   - Click "Trigger deploy" > "Deploy site"

### Method 2: Deploy via Netlify CLI

1. **Install Netlify CLI:**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify:**
   ```bash
   netlify login
   ```

3. **Initialize your site:**
   ```bash
   netlify init
   ```
   - Follow the prompts to create a new site or link to an existing one

4. **Set environment variables:**
   ```bash
   netlify env:set GEMINI_API_KEY "your-gemini-api-key"
   netlify env:set SUPABASE_URL "your-supabase-url"
   netlify env:set SUPABASE_ANON_KEY "your-supabase-anon-key"
   ```

5. **Deploy:**
   ```bash
   netlify deploy --prod
   ```

### Method 3: Deploy via Git Push (Continuous Deployment)

Once you've connected your repository to Netlify (using Method 1 or 2):

1. **Make changes to your code**
2. **Commit and push to your repository:**
   ```bash
   git add .
   git commit -m "Your commit message"
   git push origin main
   ```
3. **Netlify automatically builds and deploys** your changes

## Configuration Details

The `netlify.toml` file in the repository root contains:

- **Build settings:** Specifies the build command and publish directory
- **Redirects:** Configures client-side routing support (SPA)
- **Comments:** Guidance for environment variable setup

## Environment Variables

This app requires the following environment variables:

| Variable | Description | Where to get it |
|----------|-------------|-----------------|
| `GEMINI_API_KEY` | API key for Google Gemini AI | [Get API key](https://aistudio.google.com/app/apikey) |
| `SUPABASE_URL` | Your Supabase project URL | Supabase Dashboard > Settings > API |
| `SUPABASE_ANON_KEY` | Your Supabase anonymous/public key | Supabase Dashboard > Settings > API |

**Note:** These variables don't need a `VITE_` prefix. The Vite configuration (`vite.config.ts`) uses the `define` option to make them available to the application.

## Troubleshooting

### Build Fails

- Check the build logs in Netlify dashboard
- Verify all dependencies are listed in `package.json`
- Ensure Node.js version compatibility

### Environment Variables Not Working

- Make sure you've set `GEMINI_API_KEY` in Netlify dashboard (Site settings > Environment variables)
- Ensure the variable name is exactly `GEMINI_API_KEY` (case-sensitive)
- After adding or changing environment variables, you must trigger a new deploy
- Check the build logs for any errors related to the API key

### 404 Errors on Page Refresh

- This should be handled by the redirect rule in `netlify.toml`
- Verify the `[[redirects]]` section exists in your netlify.toml

### API Key Issues

- Ensure `GEMINI_API_KEY` is set in Netlify environment variables
- Check that your API key is valid and has not expired
- Verify API key usage limits haven't been exceeded
- Test your API key locally first using `.env.local` before deploying

## Custom Domain (Optional)

1. Go to Site settings > Domain management
2. Click "Add custom domain"
3. Follow the instructions to configure your DNS

## Deploy Previews

Netlify automatically creates deploy previews for pull requests:

- Each PR gets a unique URL for testing
- Preview deploys use the same build settings as production
- Merge to main/master branch to deploy to production

## Useful Commands

```bash
# View site info
netlify status

# Open site in browser
netlify open

# View site logs
netlify logs

# Build and test locally with Netlify functions
netlify dev
```

## Additional Resources

- [Netlify Documentation](https://docs.netlify.com/)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [Netlify Environment Variables](https://docs.netlify.com/environment-variables/overview/)
