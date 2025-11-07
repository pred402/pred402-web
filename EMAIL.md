# 📧 Email System

Complete documentation of the email/SMTP configuration using Nodemailer for sending emails.

## 📋 Overview

The email system handles:
- Email verification for new accounts
- Password reset emails
- Magic link authentication
- Organization invitations
- Custom email templates

### Tech Stack
- **Nodemailer**: Email sending library
- **SMTP**: Protocol for email delivery
- **Custom Templates**: Email content management

## ⚙️ Configuration

### Environment Variables

```env
# SMTP Configuration
MAIL_HOST="www.mnassociatesint.com"
MAIL_PORT=465
MAIL_USER="erp@mnassociatesint.com"
MAIL_PASS="Erp1234@@@@"
SMTP_FROM_EMAIL="erp@mnassociatesint.com"
SMTP_FROM_NAME="MNR Associates International"
```

### Email Provider Configuration

#### Nodemailer Setup (`packages/mail/src/provider/nodemailer.ts`)

```typescript
import nodemailer from "nodemailer";

export const send: SendEmailHandler = async ({ to, subject, text, html }) => {
  const transporter = nodemailer.createTransporter({
    host: process.env.MAIL_HOST as string,
    port: Number.parseInt(process.env.MAIL_PORT as string, 10),
    secure: true, // Use SSL/TLS for port 465
    auth: {
      user: process.env.MAIL_USER as string,
      pass: process.env.MAIL_PASS as string,
    },
  });

  const info = await transporter.sendMail({
    from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM_EMAIL}>`,
    to,
    subject,
    text,
    html,
  });

  return info.messageId;
};
```

## 📧 Email Templates

### Available Templates

The system includes pre-configured email templates:

#### 1. Email Verification (`emailVerification`)

```typescript
await sendEmail({
  to: user.email,
  templateId: "emailVerification",
  context: {
    url: verificationUrl,
    name: user.name,
  },
  locale: user.locale,
});
```

#### 2. Password Reset (`forgotPassword`)

```typescript
await sendEmail({
  to: user.email,
  templateId: "forgotPassword",
  context: {
    url: resetUrl,
    name: user.name,
  },
  locale: user.locale,
});
```

#### 3. Magic Link (`magicLink`)

```typescript
await sendEmail({
  to: email,
  templateId: "magicLink",
  context: {
    url: magicLinkUrl,
  },
  locale: userLocale,
});
```

#### 4. Organization Invitation (`organizationInvitation`)

```typescript
await sendEmail({
  to: email,
  templateId: "organizationInvitation",
  locale: locale,
  context: {
    organizationName: organization.name,
    url: invitationUrl,
  },
});
```

### Template Structure

Email templates are stored in `packages/mail/src/templates/` and include:

- **HTML Version**: Rich formatting with styles
- **Text Version**: Plain text fallback
- **Internationalization**: Multi-language support
- **Dynamic Content**: Context variables for personalization

## 🔧 SMTP Configuration

### Port Selection

| Port | Security | Usage |
|------|----------|--------|
| 587 | STARTTLS | Modern SMTP, upgrades to TLS |
| 465 | SSL/TLS | Legacy SSL, direct secure connection |
| 25 | None | Local development only |

### Security Settings

```typescript
// For port 465 (SSL)
const transporter = nodemailer.createTransporter({
  host: process.env.MAIL_HOST,
  port: 465,
  secure: true, // Use SSL
  auth: { /* credentials */ },
});

// For port 587 (STARTTLS)
const transporter = nodemailer.createTransporter({
  host: process.env.MAIL_HOST,
  port: 587,
  secure: false, // Upgrade with STARTTLS
  auth: { /* credentials */ },
});
```

## 🧪 Testing Email System

### Manual Testing

#### 1. Test SMTP Connection

```bash
# Test SMTP connection with telnet
telnet www.mnassociatesint.com 465

# Or with openssl
openssl s_client -connect www.mnassociatesint.com:465 -crlf
```

#### 2. Test Email Sending

```bash
# Create a test user via API
curl -X POST http://localhost:3001/api/auth/sign-up/email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-test-email@example.com",
    "password": "testpassword123",
    "name": "Test User",
    "callbackURL": "/app"
  }'
```

#### 3. Check Email Delivery

Monitor your email inbox for:
- Account verification email
- Welcome message
- Email verification link

### Programmatic Testing

```typescript
// Test email sending directly
import { sendEmail } from "~/lib/mail";

const result = await sendEmail({
  to: "test@example.com",
  subject: "Test Email",
  text: "This is a test email",
  html: "<h1>This is a test email</h1>",
});

console.log("Email sent:", result);
```

## 🚀 Production Email Providers

### Recommended Providers

#### 1. Resend
```env
MAIL_HOST="smtp.resend.com"
MAIL_PORT=587
MAIL_USER="resend"
MAIL_PASS="your-resend-api-key"
```

#### 2. SendGrid
```env
MAIL_HOST="smtp.sendgrid.net"
MAIL_PORT=587
MAIL_USER="apikey"
MAIL_PASS="your-sendgrid-api-key"
```

#### 3. Mailgun
```env
MAIL_HOST="smtp.mailgun.org"
MAIL_PORT=587
MAIL_USER="your-mailgun-username"
MAIL_PASS="your-mailgun-password"
```

#### 4. AWS SES
```env
MAIL_HOST="email-smtp.us-east-1.amazonaws.com"
MAIL_PORT=587
MAIL_USER="your-ses-username"
MAIL_PASS="your-ses-password"
```

### Provider-Specific Configuration

Each provider may have specific requirements:

- **API Keys**: Some providers use API keys instead of passwords
- **Domain Verification**: Required for sending from custom domains
- **Rate Limits**: Monitor sending limits and implement queuing
- **IP Whitelisting**: May be required for dedicated IPs

## 📊 Email Monitoring

### Delivery Metrics

Track these key metrics:

- **Delivery Rate**: Percentage of emails delivered
- **Open Rate**: Percentage of emails opened
- **Click Rate**: Percentage of links clicked
- **Bounce Rate**: Percentage of emails bounced
- **Complaint Rate**: Spam complaints

### Error Monitoring

Monitor for:

- **SMTP Connection Failures**: Network issues
- **Authentication Errors**: Invalid credentials
- **Rate Limiting**: Sending too many emails
- **Bounce Notifications**: Invalid email addresses

## 🔧 Email Troubleshooting

### Common Issues

#### SMTP Connection Refused

```bash
# Check if SMTP server is reachable
ping www.mnassociatesint.com

# Test specific port
telnet www.mnassociatesint.com 465

# Check firewall settings
sudo ufw status
```

#### Authentication Failed

```typescript
// Verify credentials
console.log({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  user: process.env.MAIL_USER,
  passLength: process.env.MAIL_PASS?.length,
});

// Test with different credentials
const testTransporter = nodemailer.createTransporter({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT),
  secure: true,
  auth: {
    user: "test-user",
    pass: "test-pass",
  },
});

await testTransporter.verify();
```

#### Emails Not Arriving

**Checklist:**
- [ ] SMTP credentials are correct
- [ ] Domain is verified with provider
- [ ] SPF/DKIM/DMARC records configured
- [ ] Email not in spam folder
- [ ] Check mail server logs
- [ ] Verify recipient email address

#### SSL/TLS Issues

```typescript
// Disable SSL verification for testing (not for production)
const transporter = nodemailer.createTransporter({
  host: process.env.MAIL_HOST,
  port: 465,
  secure: true,
  tls: {
    rejectUnauthorized: false, // Only for testing
  },
  auth: { /* credentials */ },
});
```

## 🌐 Internationalization

### Multi-Language Support

Email templates support multiple languages:

```typescript
await sendEmail({
  to: user.email,
  templateId: "emailVerification",
  locale: "es", // Spanish
  context: {
    url: verificationUrl,
    name: user.name,
  },
});
```

### Supported Locales

- `en` - English (default)
- `es` - Spanish
- `fr` - French
- `de` - German
- `it` - Italian
- `pt` - Portuguese

## 📧 Email Templates Structure

### Template Files

```
packages/mail/src/templates/
├── emailVerification/
│   ├── en.html
│   ├── en.txt
│   ├── es.html
│   └── es.txt
├── forgotPassword/
│   ├── en.html
│   └── en.txt
├── magicLink/
│   ├── en.html
│   └── en.txt
└── organizationInvitation/
    ├── en.html
    └── en.txt
```

### Template Variables

Templates use Handlebars-style variables:

```html
<h1>Welcome {{name}}!</h1>
<p>Please verify your email by clicking this link:</p>
<a href="{{url}}">Verify Email</a>
```

## 🔒 Security Best Practices

### Email Security

1. **HTTPS URLs**: Always use HTTPS in email links
2. **Token Expiration**: Set reasonable expiration times
3. **Rate Limiting**: Limit email sending per user/IP
4. **Content Validation**: Sanitize user input in emails

### SMTP Security

```typescript
const transporter = nodemailer.createTransporter({
  host: process.env.MAIL_HOST,
  port: 465,
  secure: true,
  tls: {
    minVersion: "TLSv1.2", // Minimum TLS version
    ciphers: "HIGH:!aNULL:!eNULL:!EXPORT:!DES:!RC4:!MD5:!PSK:!SRP:!CAMELLIA",
  },
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});
```

## 🚀 Production Deployment

### Email Service Selection

For production, choose an email service provider:

1. **Transactional Email**: Resend, SendGrid, Mailgun
2. **AWS SES**: Cost-effective for high volume
3. **Custom SMTP**: For self-hosted solutions

### Configuration Checklist

- [ ] Email provider selected and configured
- [ ] Domain verified with provider
- [ ] SPF/DKIM/DMARC records set
- [ ] SMTP credentials secured
- [ ] Rate limits understood
- [ ] Monitoring and logging enabled
- [ ] Fallback email system ready

### Scaling Considerations

1. **Queue System**: Implement email queuing for high volume
2. **Rate Limiting**: Respect provider sending limits
3. **Retry Logic**: Handle temporary failures
4. **Monitoring**: Track delivery and bounce rates

## 📊 Email Analytics

### Key Metrics

```typescript
// Track email events
const emailMetrics = {
  sent: 0,
  delivered: 0,
  opened: 0,
  clicked: 0,
  bounced: 0,
  complained: 0,
};

// Calculate rates
const deliveryRate = (delivered / sent) * 100;
const openRate = (opened / delivered) * 100;
const clickRate = (clicked / delivered) * 100;
const bounceRate = (bounced / sent) * 100;
```

### Integration with Analytics

```typescript
// Track email events
await sendEmail({
  to: user.email,
  templateId: "emailVerification",
  context: { url: verificationUrl, name: user.name },
  onSent: () => {
    analytics.track("email_sent", {
      template: "emailVerification",
      userId: user.id,
    });
  },
});
```

## 🧪 Testing Strategy

### Unit Tests

```typescript
import { sendEmail } from "~/lib/mail";

describe("Email Service", () => {
  it("should send verification email", async () => {
    const result = await sendEmail({
      to: "test@example.com",
      templateId: "emailVerification",
      context: {
        url: "https://example.com/verify",
        name: "Test User",
      },
    });

    expect(result).toBeDefined();
  });
});
```

### Integration Tests

```typescript
describe("Email Flow", () => {
  it("should send welcome email on signup", async () => {
    // Mock user signup
    const user = await createUser({
      email: "test@example.com",
      name: "Test User",
    });

    // Check that verification email was sent
    expect(mockEmailService.send).toHaveBeenCalledWith({
      to: "test@example.com",
      templateId: "emailVerification",
    });
  });
});
```

## 📚 Resources

- [Nodemailer Documentation](https://nodemailer.com/)
- [Email on Acid - Testing](https://www.emailonacid.com/)
- [Mailgun Documentation](https://documentation.mailgun.com/)
- [SendGrid Documentation](https://docs.sendgrid.com/)

---

## 🎯 Summary

The email system provides:

- ✅ **SMTP Configuration**: Flexible SMTP setup with SSL/TLS
- ✅ **Template System**: Pre-built email templates with i18n
- ✅ **Multiple Providers**: Support for major email services
- ✅ **Security**: SSL/TLS encryption and best practices
- ✅ **Monitoring**: Delivery tracking and error monitoring
- ✅ **Production Ready**: Scalable architecture for high volume
