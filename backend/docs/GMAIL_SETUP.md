# Gmail SMTP Setup for Contact Form Notifications

This guide will help you configure Gmail to send email notifications when someone submits the contact form on your portfolio.

## Prerequisites

- A Gmail account
- 2-Step Verification enabled on your Google account

## Step 1: Enable 2-Step Verification

1. Go to your [Google Account](https://myaccount.google.com/)
2. Navigate to **Security** → **2-Step Verification**
3. Follow the prompts to enable 2-Step Verification if not already enabled

## Step 2: Create an App Password

1. Go to your [Google Account](https://myaccount.google.com/)
2. Navigate to **Security** → **2-Step Verification** → **App passwords** (at the bottom)
   - Direct link: https://myaccount.google.com/apppasswords
3. Click **Select app** and choose **Mail**
4. Click **Select device** and choose **Other (Custom name)**
5. Enter a name like "Portfolio Contact Form"
6. Click **Generate**
7. Copy the 16-character password (shown as `xxxx xxxx xxxx xxxx`)

## Step 3: Update Environment Variables

Open your `backend/.env` file and update the following:

```bash
# Gmail SMTP Configuration
CONTACT_EMAIL_ENABLED=True
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-16-char-app-password
```

**Important:**
- Use your full Gmail address for `GMAIL_USER`
- Use the 16-character app password (remove spaces) for `GMAIL_APP_PASSWORD`
- **Never** use your regular Gmail password
- **Never** commit the `.env` file to version control

## Step 4: Test the Configuration

1. Restart your backend server:
   ```bash
   cd backend
   uvicorn app.main:app --reload
   ```

2. Submit a test message through your contact form

3. Check your Gmail inbox for the notification email

## Email Format

When someone submits the contact form, you'll receive an email with:

- **Subject:** "Portfolio Contact Form: [their subject]"
- **From:** Your Gmail address
- **Reply-To:** The submitter's email (so you can reply directly)
- **Body:** HTML-formatted email containing:
  - Name
  - Email
  - Company (if provided)
  - Phone (if provided)
  - Subject
  - Message
  - Message ID (for tracking)

## Troubleshooting

### Error: "Username and Password not accepted"
- Make sure you're using an **App Password**, not your regular Gmail password
- Verify 2-Step Verification is enabled
- Check that the app password doesn't have spaces

### Error: "SMTP AUTH extension not supported"
- Ensure you're using `smtp.gmail.com` on port `587`
- This is already configured in the `email_service.py`

### Emails not arriving
- Check your spam folder
- Verify `CONTACT_EMAIL_ENABLED=True` in `.env`
- Check the backend logs for email sending errors
- Ensure your Gmail account is not rate-limited (Gmail has sending limits)

### Gmail Daily Sending Limits
- Gmail accounts have a daily sending limit (typically 500 emails/day for regular accounts)
- For high-traffic sites, consider using a dedicated email service like:
  - AWS SES
  - SendGrid
  - Mailgun

## Security Best Practices

1. **Never share your app password**
2. **Keep `.env` in `.gitignore`** (already configured)
3. **Revoke app passwords** if they're compromised:
   - Go to https://myaccount.google.com/apppasswords
   - Delete the compromised password
   - Generate a new one

4. **For production**, consider:
   - Using a dedicated email service (AWS SES, SendGrid)
   - Storing credentials in AWS Secrets Manager or similar
   - Implementing rate limiting on the contact form

## Disabling Email Notifications

To disable email notifications while keeping the contact form functional:

```bash
CONTACT_EMAIL_ENABLED=False
```

The contact form will still log submissions, but won't send emails.
