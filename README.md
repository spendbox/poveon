<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/17Yrej1o5YheVSmrpakvASM6egoaD3Mfx

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Deploy to Netlify

This app is ready to deploy on Netlify. See the [Deployment Guide](DEPLOYMENT.md) for detailed instructions on:

- Deploying via Netlify UI (recommended)
- Deploying via Netlify CLI
- Setting up continuous deployment
- Configuring environment variables
- Troubleshooting common issues

**Quick start:** Connect this repository to Netlify, set the `GEMINI_API_KEY` environment variable, and deploy!
