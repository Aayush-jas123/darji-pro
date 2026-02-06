# 📧 Notification Setup Guide

This guide will help you configure email (SMTP) and SMS/WhatsApp (Twilio) notifications for Darji Pro.

---

## Email Notifications (SMTP)

### Step 1: Get SMTP Credentials

#### Option A: Gmail (Recommended for Testing)

1. Go to your Google Account settings
2. Enable 2-Factor Authentication
3. Generate an App Password:
   - Go to Security → 2-Step Verification → App passwords
   - Select "Mail" and your device
   - Copy the generated 16-character password

#### Option B: SendGrid (Recommended for Production)

1. Sign up at https://sendgrid.com
2. Create an API key
3. Verify your sender email/domain

#### Option C: Other Providers

- **Mailgun**: https://www.mailgun.com
- **Amazon SES**: https://aws.amazon.com/ses/
- **Postmark**: https://postmarkapp.com

### Step 2: Configure Environment Variables

Add to `backend/.env`:

```env
# Email Configuration
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password-here
EMAIL_FROM=noreply@darjipro.com
EMAIL_FROM_NAME=Darji Pro
```

### Step 3: Test Email Notifications

```bash
# Start backend server
cd backend
uvicorn app.main:app --reload

# Create a test appointment to trigger confirmation email
# Or use the API directly:
curl -X POST http://localhost:8000/api/notifications/test-email \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## SMS & WhatsApp Notifications (Twilio)

### Step 1: Create Twilio Account

1. Sign up at https://www.twilio.com
2. Get a free trial account (includes $15 credit)
3. Verify your phone number

### Step 2: Get Twilio Credentials

1. Go to Twilio Console Dashboard
2. Copy your **Account SID** and **Auth Token**
3. Get a phone number:
   - Go to Phone Numbers → Buy a Number
   - Select a number with SMS capability
   - For WhatsApp: Enable WhatsApp on your number

### Step 3: Configure Environment Variables

Add to `backend/.env`:

```env
# Twilio Configuration
TWILIO_ACCOUNT_SID=your-account-sid-here
TWILIO_AUTH_TOKEN=your-auth-token-here
TWILIO_PHONE_NUMBER=+1234567890
TWILIO_WHATSAPP_NUMBER=whatsapp:+1234567890
```

### Step 4: Test SMS Notifications

```bash
# Test SMS
curl -X POST http://localhost:8000/api/notifications/test-sms \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"phone": "+1234567890", "message": "Test SMS from Darji Pro"}'
```

### Step 5: Test WhatsApp Notifications

1. Join your Twilio WhatsApp Sandbox:
   - Go to Twilio Console → Messaging → Try it out → Send a WhatsApp message
   - Send the join code to your WhatsApp number

2. Test WhatsApp message:
```bash
curl -X POST http://localhost:8000/api/notifications/test-whatsapp \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"phone": "+1234567890", "message": "Test WhatsApp from Darji Pro"}'
```

---

## Notification Templates

Notification templates are located in `backend/app/services/notification.py`.

### Customizing Templates

Edit the templates in the notification service:

```python
# Appointment Confirmation
subject = f"Appointment Confirmed - {appointment_date}"
message = f"""
Dear {customer_name},

Your appointment has been confirmed!

Date: {appointment_date}
Time: {appointment_time}
Tailor: {tailor_name}
Branch: {branch_name}

Thank you for choosing Darji Pro!
"""
```

---

## Troubleshooting

### Email Not Sending

1. **Check SMTP credentials**: Verify username and password
2. **Check firewall**: Ensure port 587 is not blocked
3. **Check spam folder**: Emails might be filtered
4. **Enable "Less secure apps"** (Gmail): If using Gmail without App Password

### SMS Not Sending

1. **Verify phone number format**: Must include country code (+1234567890)
2. **Check Twilio balance**: Ensure you have credits
3. **Verify number**: Make sure recipient number is verified (trial accounts)
4. **Check Twilio logs**: Go to Twilio Console → Monitor → Logs

### WhatsApp Not Sending

1. **Join sandbox**: Recipient must join your WhatsApp sandbox first
2. **Check template approval**: Production WhatsApp requires approved templates
3. **Verify number format**: Use `whatsapp:+1234567890` format

---

## Production Checklist

- [ ] Use production SMTP service (SendGrid, Mailgun, etc.)
- [ ] Verify sender domain (SPF, DKIM records)
- [ ] Upgrade Twilio account (remove trial limitations)
- [ ] Submit WhatsApp templates for approval
- [ ] Set up monitoring for failed notifications
- [ ] Configure retry logic for failed sends
- [ ] Add unsubscribe links to emails
- [ ] Comply with GDPR/CAN-SPAM regulations

---

## Cost Estimates

### Email (SendGrid)
- **Free Tier**: 100 emails/day
- **Essentials**: $19.95/month (50,000 emails)
- **Pro**: $89.95/month (100,000 emails)

### SMS (Twilio)
- **Cost**: ~$0.0075 per SMS (US)
- **Example**: 1,000 SMS = ~$7.50

### WhatsApp (Twilio)
- **Business-initiated**: $0.005 per message
- **User-initiated**: Free (first 24 hours)

---

## Support

- **Email Issues**: Check SMTP provider documentation
- **Twilio Issues**: https://support.twilio.com
- **Darji Pro Support**: support@darjipro.com

---

**Last Updated**: February 6, 2026
