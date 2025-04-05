# Deploying the WNY AI Website

This guide covers the steps to deploy the WNY AI website to production using Netlify, which offers the best integration with forms and serverless functions.

## Preparing for Deployment

1. **Ensure Airtable is Set Up**
   - Complete all steps in AIRTABLE-SETUP.md
   - Test that your Airtable base is correctly configured
   - Copy your API key and Base ID

2. **Finalize Your Code**
   - Run a local build to check for errors:
     ```bash
     cd wnyai-frontend
     npm run build
     ```
   - Check that the site works as expected with `npm run preview`

## Option 1: Deploying to Netlify (Recommended)

### Step 1: Create a Netlify Account
1. Sign up at [netlify.com](https://www.netlify.com/)
2. Verify your email

### Step 2: Set Up Git Repository (Optional but Recommended)
1. Create a GitHub, GitLab, or Bitbucket repository
2. Push your code:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

### Step 3: Deploy via Netlify UI
1. Log in to Netlify
2. Click "Add new site" > "Import an existing project"
3. Connect to your Git provider and select your repository
   
   **OR if not using Git:**
   - Click "Deploy manually" and drag your `wnyai-frontend/dist` folder after building

### Step 4: Configure Build Settings
If deploying from Git, configure:
- Build command: `cd wnyai-frontend && npm install && npm run build`
- Publish directory: `wnyai-frontend/dist`

### Step 5: Configure Environment Variables
1. Go to Site settings > Environment variables
2. Add the following variables:
   - `VITE_AIRTABLE_API_KEY`
   - `VITE_AIRTABLE_BASE_ID`
   - `VITE_AIRTABLE_SUBSCRIBERS_TABLE`
   - `VITE_AIRTABLE_EVENTS_TABLE`
   - `VITE_AIRTABLE_CONTENT_TABLE`

### Step 6: Set Up Custom Domain (Optional)
1. Go to Site settings > Domain management
2. Click "Add custom domain"
3. Follow the DNS configuration instructions

### Step 7: Verify Deployment
1. Visit your Netlify URL (or custom domain)
2. Test all functionality, especially:
   - Email subscription form
   - Events display
   - Discord and social links
   - Privacy Policy and Terms of Service modals

## Option 2: Deploying to Vercel

### Step 1: Create a Vercel Account
1. Sign up at [vercel.com](https://vercel.com/)
2. Verify your email

### Step 2: Install Vercel CLI (Optional)
```bash
npm install -g vercel
```

### Step 3: Deploy via Vercel UI
1. Log in to Vercel
2. Click "Import Project"
3. Connect to your Git repository or deploy directly

### Step 4: Configure Project Settings
- Framework Preset: Vite
- Root Directory: wnyai-frontend
- Build Command: npm run build
- Output Directory: dist

### Step 5: Configure Environment Variables
Add the same environment variables as listed in the Netlify section.

## Option 3: Deploying to Firebase Hosting

### Step 1: Install Firebase Tools
```bash
npm install -g firebase-tools
```

### Step 2: Initialize Firebase
```bash
cd wnyai-frontend
firebase login
firebase init hosting
```
- Select your Firebase project
- Specify "dist" as your public directory
- Configure as a single-page app: Yes
- Set up automatic builds: No

### Step 3: Build Your Project
```bash
npm run build
```

### Step 4: Deploy to Firebase
```bash
firebase deploy
```

## Maintaining Your Deployment

### Updating Content via Airtable
1. Log in to your Airtable account
2. Navigate to your WNY AI base
3. Update records in the relevant tables:
   - Add new events
   - Update site content
   - Changes will reflect on your site immediately

### Updating Code
If using Git with Netlify/Vercel:
1. Make code changes
2. Commit and push to your repository
3. Deployment will happen automatically

If manually deploying:
1. Make code changes
2. Build your project
3. Upload the new dist folder

## Monitoring and Analytics

### Add Google Analytics (Optional)
1. Create a Google Analytics account
2. Add your tracking ID to Airtable's Site Content table with key `google_analytics_id`
3. Update your code to use the tracking ID

### Set Up Error Monitoring
1. Consider adding Sentry.io for error monitoring
2. Install with: `npm install @sentry/react`
3. Configure in your main.tsx file

## Troubleshooting Common Issues

### Environment Variables Not Loading
- Check that variables are correctly set in your hosting dashboard
- Environment variables are case-sensitive
- Redeploy after making changes

### API Rate Limits
- Airtable Free plan has limits (5 requests/second)
- Consider implementing caching for events and site content
- Monitor usage in the Airtable dashboard

### CORS Issues
- If experiencing CORS errors, ensure your hosting domain is properly configured
- Use a serverless function as a proxy if needed

## Additional Resources

- [Netlify Documentation](https://docs.netlify.com/)
- [Vercel Documentation](https://vercel.com/docs)
- [Firebase Hosting Documentation](https://firebase.google.com/docs/hosting)
- [Airtable API Documentation](https://airtable.com/developers/web/api/introduction)