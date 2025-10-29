<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/17Yrej1o5YheVSmrpakvASM6egoaD3Mfx

## Run Locally

**Prerequisites:**  Node.js

### Setup Steps:

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure Gemini API Key:**

   a. Get your API key from [Google AI Studio](https://aistudio.google.com/app/apikey)

   b. Create a `.env.local` file in the root directory:
   ```bash
   cp .env.example .env.local
   ```

   c. Open `.env.local` and replace `your_gemini_api_key_here` with your actual API key:
   ```
   GEMINI_API_KEY=AIzaSy...your_actual_key_here
   ```

3. **Run the app:**
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:3000`

### Note on Environment Variables

The Vite configuration automatically loads `GEMINI_API_KEY` from your `.env.local` file and makes it available to the application. The `.env.local` file is gitignored for security, so your API key will not be committed to version control.

## Deploy to Netlify

This app is ready to deploy on Netlify. See the [Deployment Guide](DEPLOYMENT.md) for detailed instructions on:

- Deploying via Netlify UI (recommended)
- Deploying via Netlify CLI
- Setting up continuous deployment
- Configuring environment variables
- Troubleshooting common issues

**Quick start:** Connect this repository to Netlify, set the `GEMINI_API_KEY` environment variable, and deploy!
