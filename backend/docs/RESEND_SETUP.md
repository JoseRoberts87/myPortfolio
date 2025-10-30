# Resend Email Setup (Easier Alternative to Gmail)

**Resend** is a modern email API that's much simpler to set up than Gmail SMTP. Perfect if you can't access Gmail app passwords.

## Why Resend?

- ✅ **No 2-Step Verification required**
- ✅ **No complex SMTP configuration**
- ✅ **Free tier: 3,000 emails/month**
- ✅ **5-minute setup**
- ✅ **Better deliverability than SMTP**

## Setup Steps

### Step 1: Create Resend Account

1. Go to https://resend.com/
2. Click **"Start Building"** or **"Sign Up"**
3. Sign up with your email or GitHub account
4. Verify your email address

### Step 2: Get API Key

1. Once logged in, go to **API Keys** in the sidebar
2. Click **"Create API Key"**
3. Name it "Portfolio Contact Form"
4. Select **"Sending access"**
5. Click **"Add"**
6. **Copy the API key** (starts with `re_...`)
   - You won't be able to see it again!

### Step 3: Verify Your Email Domain (Optional but Recommended)

For better deliverability, verify your domain:

1. Go to **Domains** in Resend dashboard
2. Click **"Add Domain"**
3. Enter your domain (e.g., `therpiproject.com`)
4. Add the DNS records shown to your domain provider
5. Wait for verification (usually a few minutes)

**Or** use Resend's test domain for now: `onboarding@resend.dev`

### Step 4: Update Environment Variables

Open `backend/.env` and update:

```bash
# Email Service Selection
EMAIL_SERVICE=resend  # Options: gmail, resend
CONTACT_EMAIL_ENABLED=True

# Resend Configuration
RESEND_API_KEY=re_your_api_key_here
RESEND_FROM_EMAIL=onboarding@resend.dev  # Or your@domain.com after verification
RESEND_TO_EMAIL=your-email@gmail.com  # Where you want to receive notifications
```

### Step 5: Install httpx (if not already installed)

```bash
cd backend
pip install httpx
```

### Step 6: Restart Backend

```bash
uvicorn app.main:app --reload
```

### Step 7: Test

Submit a test message through your contact form and check your email!

## Free Tier Limits

- **3,000 emails/month** (more than enough for a portfolio)
- **100 emails/day**
- Resets monthly

For more, paid plans start at $20/month.

## Comparison: Gmail vs Resend

| Feature | Gmail SMTP | Resend |
|---------|-----------|--------|
| Setup Complexity | Medium (app passwords) | Easy (just API key) |
| 2-Step Verification Required | Yes | No |
| Free Emails/Month | 500 | 3,000 |
| Custom Domain | No | Yes (free) |
| Deliverability | Good | Excellent |
| Rate Limits | 500/day | 100/day (free tier) |
| Setup Time | 10-15 min | 5 min |

## Troubleshooting

### Error: "Invalid API Key"
- Make sure you copied the full API key (starts with `re_`)
- Check for extra spaces in the `.env` file
- Regenerate the API key if needed

### Emails Going to Spam
- Verify your domain in Resend (adds SPF/DKIM records)
- Use Resend's onboarding domain initially for testing

### Error: "httpx module not found"
```bash
cd backend
pip install httpx
```

## Switching Between Gmail and Resend

You can switch email services anytime by changing `EMAIL_SERVICE` in `.env`:

```bash
# Use Gmail
EMAIL_SERVICE=gmail

# Use Resend (recommended)
EMAIL_SERVICE=resend
```

Both sets of credentials can remain in your `.env` file.

## Security

- ✅ API key stored in environment variables
- ✅ `.env` excluded from version control
- ✅ Never hardcode credentials
- ✅ Rotate API keys if compromised (via Resend dashboard)
