# Deployment Guide - Netlify

This guide explains how to deploy the QuickPost application to Netlify.

## Prerequisites

- A [Netlify account](https://app.netlify.com/signup) (free tier available)
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
   - Add the following variable:
     - **Key:** `GEMINI_API_KEY`
     - **Value:** Your Gemini API key
   - Important: For Vite to access environment variables in the browser, they must be prefixed with `VITE_`
   - You may need to update your code to use `VITE_GEMINI_API_KEY` instead

4. **Redeploy if needed:**
   - After adding environment variables, trigger a new deploy from the Deploys tab

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
   netlify env:set GEMINI_API_KEY "your-api-key-here"
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

This app requires the following environment variable:

| Variable | Description | Where to get it |
|----------|-------------|-----------------|
| `GEMINI_API_KEY` | API key for Google Gemini | [Get API key](https://aistudio.google.com/app/apikey) |

**Note:** If your Vite app uses environment variables, they must be prefixed with `VITE_` to be exposed to the client-side code. Update your code accordingly if needed.

## Troubleshooting

### Build Fails

- Check the build logs in Netlify dashboard
- Verify all dependencies are listed in `package.json`
- Ensure Node.js version compatibility

### Environment Variables Not Working

- Make sure you've set them in Netlify dashboard (Site settings > Environment variables)
- For Vite apps, client-side variables must be prefixed with `VITE_`
- Redeploy after adding/changing environment variables

### 404 Errors on Page Refresh

- This should be handled by the redirect rule in `netlify.toml`
- Verify the `[[redirects]]` section exists in your netlify.toml

### API Key Issues

- Ensure `GEMINI_API_KEY` (or `VITE_GEMINI_API_KEY`) is set in Netlify
- Check that your API key is valid and has not expired
- Verify API key usage limits haven't been exceeded

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
