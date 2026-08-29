# Security Configuration and Procedures

This document outlines the security procedures, testing methods, and monitoring configurations established for the Pixelwind LMS, using exclusively free-tier tools.

## 1. Cloudflare Security

The application is configured to be hosted on **Cloudflare Pages** which natively provides:
- Free HTTPS/SSL automatically provisioned.
- Basic DDoS protection (Cloudflare's default global network protection).
- Security headers (via the `public/_headers` file).

### How to Deploy
1. Connect your GitHub repository to Cloudflare Pages.
2. Set the build command to `npm run build`.
3. Set the build output directory to `dist`.
4. Cloudflare Pages will automatically apply the `_headers` rules on deployment.

## 2. Cloudflare Turnstile (Bot Protection)

Cloudflare Turnstile is implemented on the **Login** page to prevent brute-force attacks and credential stuffing without relying on paid CAPTCHA services.

### Configuration
- A testing site key (`1x00000000000000000000AA`) is used by default if the environment variable is missing.
- **For Production**: Obtain a free Site Key from the Cloudflare Dashboard (Turnstile section) and add it to your environment variables as `VITE_TURNSTILE_SITE_KEY`.

## 3. Sentry (Error Tracking)

Sentry's free tier is integrated to monitor frontend errors.
- Sensitive data (like passwords and tokens) in HTTP requests is automatically scrubbed via the `beforeSend` hook in `src/main.tsx` before being sent to Sentry.
- **For Production**: Obtain a DSN from your Sentry project and add it to your environment variables as `VITE_SENTRY_DSN`.

## 4. OWASP ZAP (Security Scanning)

To run a security scan against the application locally or in a staging environment, you can use the free open-source **OWASP ZAP** Docker container.

### Running a ZAP Baseline Scan
If you have Docker installed, you can run a quick baseline scan against your locally running application (or production URL):

```bash
# Replace http://localhost:5173 with your actual application URL
docker run -t owasp/zap2docker-stable zap-baseline.py -t http://localhost:5173
```

> **Note**: Do not run intensive, authenticated active scans against production unless you intend to stress-test your live database. Run full scans against a local or staging environment.

## 5. Uptime Monitoring (UptimeRobot)

To monitor the availability of your website, you can use the completely free tier of **UptimeRobot**.

### Setup Instructions
1. Create a free account at [uptimerobot.com](https://uptimerobot.com).
2. Click "Add New Monitor".
3. **Monitor Type**: HTTP(s).
4. **Friendly Name**: Pixelwind LMS.
5. **URL (or IP)**: Your production URL (e.g., `https://pixelwind.pages.dev`).
6. **Monitoring Interval**: 5 minutes (the lowest available on the free tier).
7. Select your email for "Alert Contacts To Notify".

## 6. Secrets Management

- **`.env.example`** is provided to map out required environment variables.
- **`.gitignore`** is configured to ignore all `.env` and `.env.*` files.
- Never commit actual secrets (like Supabase Service Role Keys or API secrets) into this frontend repository.
