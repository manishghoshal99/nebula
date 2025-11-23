# Deploying to Vercel

This guide explains how to deploy the **Nebula** web application to Vercel.

## Prerequisites
1.  A [GitHub account](https://github.com/).
2.  A [Vercel account](https://vercel.com/signup).
3.  The **Nebula** repository pushed to your GitHub.

## One-Click Deployment
The easiest way to deploy is to click the button below. This will clone the repository to your Vercel account and deploy it automatically.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fmanishghoshal99%2Fnebula%2Ftree%2Fmaster%2Fweb_app&project-name=nebula-web-app&repository-name=nebula-web-app)

> **Note**: This link is configured to deploy the `web_app` directory specifically.

## Manual Deployment Steps

If you prefer to configure it manually:

1.  **Log in to Vercel**: Go to [vercel.com](https://vercel.com) and log in.
2.  **Add New Project**: Click **"Add New..."** -> **"Project"**.
3.  **Import Repository**: Find `nebula` in the list of your GitHub repositories and click **"Import"**.
4.  **Configure Project**:
    *   **Framework Preset**: Select **Next.js**.
    *   **Root Directory**: Click "Edit" and select `web_app`. **This is critical** because the Next.js app lives in the `web_app` folder, not the root.
5.  **Deploy**: Click **"Deploy"**.

## Verification
Once deployed, Vercel will provide a URL (e.g., `https://nebula-web-app.vercel.app`). Visit this link to verify the application is running correctly.
