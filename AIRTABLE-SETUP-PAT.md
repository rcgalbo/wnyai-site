# Setting Up Airtable with Personal Access Tokens

Airtable now uses Personal Access Tokens (PATs) instead of API keys. This guide walks you through setting up Airtable as a backend service for your WNY AI website using the current authentication method.

## 1. Create a Personal Access Token

1. Log in to your Airtable account
2. Go to your [Account Overview page](https://airtable.com/account)
3. Click on "Developer hub" in the left sidebar
4. Select "Personal access tokens"
5. Click "Create new token"
6. Name your token (e.g., "WNY AI Website")
7. Set the token's scope:
   - At minimum, select `data.records:read` and `data.records:write`
   - For full functionality, also include `schema.bases:read`
8. Set an expiration date (or leave it as "Never expires" for development)
9. Click "Create token"
10. **IMPORTANT**: Copy and save your token immediately as it will only be shown once

## 2. Find Your Base ID

1. Go to [airtable.com](https://airtable.com) and open your base
2. Look at the URL, which will look like:
   ```
   https://airtable.com/appXXXXXXXXXXXXXX/tblYYYYYYYYYYYYYY/viwZZZZZZZZZZZZZZ
   ```
3. The part after `/app` and before the next `/` is your Base ID
   - For example: `appXXXXXXXXXXXXXX`
4. Copy this Base ID

## 3. Set Up Tables

Create these three tables in your Airtable base:

### Subscribers Table
- Table name: `Subscribers`
- Fields:
  - Email (Single line text, Primary field)
  - Name (Single line text)
  - Signup Date (Date, with time)
  - Source (Single select: Website, Event, Referral)
  - Active (Checkbox)

### Events Table
- Table name: `Events`
- Fields:
  - Title (Single line text, Primary field)
  - Date (Date, with time)
  - Location (Single line text)
  - Description (Long text)
  - Registration Link (URL)
  - Virtual Event (Checkbox)
  - Featured (Checkbox)

### Site Content Table
- Table name: `Site Content`
- Fields:
  - Content Key (Single line text, Primary field)
  - Content Value (Long text)
  - Last Updated (Date, with time)

## 4. Add Site Content Records

In the Site Content table, add these essential records:

| Content Key | Content Value |
|-------------|--------------|
| discord_link | https://discord.gg/your-invite-link |
| twitter_link | https://twitter.com/your-handle |
| linkedin_link | https://linkedin.com/company/your-company |
| github_link | https://github.com/your-org |
| privacy_policy | *Paste your privacy policy text* |
| terms_of_service | *Paste your terms of service text* |

## 5. Configure Environment Variables

Create a `.env.local` file in your project's `wnyai-frontend` directory:

```
VITE_AIRTABLE_ACCESS_TOKEN=your_personal_access_token_here
VITE_AIRTABLE_BASE_ID=your_base_id_here
VITE_AIRTABLE_SUBSCRIBERS_TABLE=Subscribers
VITE_AIRTABLE_EVENTS_TABLE=Events
VITE_AIRTABLE_CONTENT_TABLE="Site Content"
```

**Notes:**
- Make sure to use quotes around "Site Content" because it contains a space
- Replace `your_personal_access_token_here` with the token you created
- Replace `your_base_id_here` with your Base ID

## 6. Start the Development Server

Run the development server to test your Airtable connection:

```bash
cd wnyai-frontend
npm run dev
```

## 7. Troubleshooting

If you have issues connecting to Airtable:

1. Check the debug panel by going to `/?debug=true`
2. Verify your token has the correct permissions
3. Check that your Base ID is correct (should start with "app")
4. Ensure table names match exactly (including case)
5. Check your browser console for detailed error messages

## 8. Deploying to Production

When deploying to Vercel or another hosting service:

1. Add the same environment variables to your hosting platform
2. Consider creating a separate Airtable token for production with appropriate expiration settings
3. Make sure to keep your token secure and never commit it to your repository