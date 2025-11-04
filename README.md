# Mini Admin App

A simple web application that executes 3 API calls sequentially:
1. **API 1**: Automatically called on page load with phone and password to get an access token
2. **API 2**: Sends data from an input box (uses access token from API 1)
3. **API 3**: Sends JSON body for client onboarding (uses access token from API 1)

## How It Works

1. When the app loads, it automatically calls API 1 with your phone number and password (stored in GitHub Secrets)
2. API 1 returns an access token
3. This access token is automatically used in the Authorization header for API 2 and API 3
4. The token is refreshed on every page load/refresh

## Setup

1. **Clone or download this repository**

2. **Configure your APIs**:
   - Copy `config.example.js` to `config.js`
   - Edit `config.js` with your actual API endpoints and credentials:
     ```javascript
     const CONFIG = {
         api1: {
             url: 'https://your-api.com/auth/login',
             method: 'POST',
             phone: 'YOUR_PHONE_NUMBER',
             password: 'YOUR_PASSWORD',
             headers: {}
             // Optional: if token is in a custom field, specify it:
             // tokenField: 'data.access_token'
         },
         api2: {
             url: 'https://your-api.com/endpoint2',
             method: 'POST',
             headers: {},
             bodyTemplate: '{"data": "{{input}}"}'
         },
         api3: {
             url: 'https://your-api.com/client/onboarding',
             method: 'POST',
             headers: {}
         }
     };
     ```

3. **Test locally**:
   - Open `index.html` in a web browser
   - Or use a local server:
     ```bash
     # Python 3
     python -m http.server 8000
     
     # Node.js (with http-server)
     npx http-server
     ```

## Deployment to GitHub Pages

### Important Security Note

**GitHub Secrets are NOT accessible to client-side JavaScript in GitHub Pages.** Secrets only work in GitHub Actions workflows, not in the deployed static site.

For client-side apps, you have a few options:

### Option 1: Manual Configuration (Recommended for sensitive credentials)
1. Create a GitHub repository
2. Add `config.js` to `.gitignore` (already done)
3. Deploy to GitHub Pages
4. Manually upload `config.js` to your GitHub Pages site using GitHub's web interface or by creating it directly in the repository after deployment

### Option 2: GitHub Actions with Build Step
1. Store credentials in GitHub Secrets
2. Use GitHub Actions to inject credentials at build time
3. Deploy the built files to GitHub Pages

### Option 3: Use Environment Variables (Still exposed)
You can use environment variables, but note that they will be visible in the client-side code.

### Deployment Steps:

1. **Create a GitHub repository**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git push -u origin main
   ```

2. **Enable GitHub Pages**:
   - Go to your repository Settings
   - Navigate to Pages
   - Select source branch (usually `main`)
   - Select folder (usually `/root`)
   - Save

3. **Add config.js** (if using Option 1):
   - After deployment, you can add `config.js` directly through GitHub's web interface
   - Or use GitHub Actions to create it from secrets

### Alternative Free Hosting Options

1. **Vercel** (Recommended):
   - Free tier available
   - Can use environment variables
   - Easy deployment from GitHub
   - Visit: https://vercel.com

2. **Netlify**:
   - Free tier available
   - Environment variables support
   - Easy deployment from GitHub
   - Visit: https://netlify.com

3. **GitHub Pages with GitHub Actions**:
   - Use GitHub Secrets in Actions
   - Build and deploy automatically

## GitHub Actions Setup (Already Configured)

The GitHub Actions workflow is already set up in `.github/workflows/deploy.yml`. 

### Setup Steps

1. **Edit the workflow file** (`.github/workflows/deploy.yml`):
   - Update the API URLs (replace `https://api.example.com/...` with your actual endpoints)
   - Update the HTTP methods if needed (default is 'POST')
   - Update the `bodyTemplate` for API 2 if needed

2. **Add GitHub Secrets** (only 2 secrets needed):
   - Go to your repository: **Settings → Secrets and variables → Actions → New repository secret**
   - Add these two secrets:
     - **API1_PHONE** - Your phone number
     - **API1_PASSWORD** - Your password

### Token Extraction

The app automatically extracts the access token from API 1 response. It tries these field names:
- `accessToken`
- `access_token`
- `token`
- `data.accessToken`
- `data.access_token`
- `result.accessToken`
- `result.access_token`
- `response.accessToken`
- `response.access_token`

If your API uses a different field name, you can specify it in `config.js`:
```javascript
api1: {
    // ...
    tokenField: 'data.token' // Custom field path
}
```

## Usage

1. Open the app in a browser (or refresh the page)
2. API 1 will be called automatically on page load with your phone and password
3. Wait for authentication to complete - the access token will be extracted automatically
4. Once authenticated, enter data in the input box and click "Send to API 2"
5. Enter JSON body in the textarea and click "Send to API 3"
6. Both API 2 and API 3 will use the access token from API 1 automatically

## Security Considerations

- **Never commit `config.js` with real credentials to a public repository**
- Credentials in client-side JavaScript are always visible to users
- For production use, consider:
  - Using a backend proxy to hide credentials
  - Implementing proper authentication
  - Using environment variables (but still exposed in client)
  - Using serverless functions as a proxy

## License

MIT

