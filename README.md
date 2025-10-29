<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Poveon - AI-Powered Request Board

A platform where users can post requests for products or services with AI-powered assistance. Built with React, Vite, Supabase, and Google Gemini AI.

## Features

- ✨ **AI-Powered Request Creation** - Gemini AI helps draft request details
- 🔐 **User Authentication** - Secure login with Supabase Auth
- 💰 **Wallet System** - Virtual wallet for payments and transactions
- 📋 **Request Management** - Create, view, and manage service requests
- 🎯 **Application System** - Users can apply to fulfill requests
- ⚡ **Real-time Updates** - Live updates for new requests and applications
- ✅ **User Verification** - Verified user badges for trust

View the original app in AI Studio: https://ai.studio/apps/drive/17Yrej1o5YheVSmrpakvASM6egoaD3Mfx

## Run Locally

**Prerequisites:**  Node.js

### Setup Steps:

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up Supabase (Database & Backend):**

   Follow the complete guide: **[SUPABASE_SETUP.md](SUPABASE_SETUP.md)**

   Quick steps:
   - Create a free Supabase account at [supabase.com](https://supabase.com)
   - Create a new project
   - Run the SQL schema from `database-schema.sql` in the SQL Editor
   - Copy your project URL and anon key

3. **Configure Environment Variables:**

   a. Create a `.env.local` file:
   ```bash
   cp .env.example .env.local
   ```

   b. Fill in your credentials in `.env.local`:
   ```
   GEMINI_API_KEY=your_gemini_api_key_here
   SUPABASE_URL=https://xxxxx.supabase.co
   SUPABASE_ANON_KEY=your_supabase_anon_key_here
   ```

   Where to get each:
   - **GEMINI_API_KEY**: [Google AI Studio](https://aistudio.google.com/app/apikey)
   - **SUPABASE_URL & SUPABASE_ANON_KEY**: Your Supabase project settings → API

4. **Run the app:**
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:3000`

### Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Backend**: Supabase (PostgreSQL + Auth + Real-time)
- **AI**: Google Gemini 2.5 Flash
- **Styling**: Tailwind CSS
- **Hosting**: Netlify

## Deploy to Netlify

This app is ready to deploy on Netlify. See the [Deployment Guide](DEPLOYMENT.md) for detailed instructions on:

- Deploying via Netlify UI (recommended)
- Deploying via Netlify CLI
- Setting up continuous deployment
- Configuring environment variables
- Troubleshooting common issues

**Quick start:** Connect this repository to Netlify, set the `GEMINI_API_KEY` environment variable, and deploy!
