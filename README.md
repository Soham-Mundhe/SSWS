# SSWS (Smart Soldier Wearable System)

A futuristic, cyberpunk-themed military command and tracking dashboard built with HTML, CSS, JavaScript, Leaflet.js, and Chart.js.

## Files Structure
All files are static and ready for production deployment.
- `index.html` - Main Dashboard (Entry Point)
- `tracking.html` - Live Tracking Map
- `soldier.html` - Soldier Intelligence Data
- `alerts.html` - Emergency Alerts
- `reports.html` - Tactical Reports
- `settings.html` - System Configuration

## Deploying to Vercel

This project is a 100% static frontend application (Vanilla HTML/CSS/JS). It requires zero build configuration to deploy to Vercel. 

### Method 1: Deploy via GitHub (Recommended)
1. Go to [GitHub](https://github.com/) and create a new repository called `SSWS`.
2. Upload all the files in this folder to that GitHub repository.
3. Go to [Vercel](https://vercel.com/) and log in.
4. Click **"Add New Project"**.
5. Import your new `SSWS` GitHub repository.
6. Leave all settings as default (Vercel will auto-detect it as a static site).
7. Click **Deploy**.

### Method 2: Deploy via Vercel CLI
If you have Node.js installed, you can deploy directly from your terminal:
1. Open your terminal in this folder.
2. Run `npm i -g vercel` to install the Vercel CLI.
3. Run `vercel` and follow the prompts to deploy instantly.
