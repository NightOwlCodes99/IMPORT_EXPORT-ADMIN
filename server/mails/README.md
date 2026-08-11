# 📧 Email Templates

Professional, responsive email templates for Nexarion Global Exports platform.

## 📁 Structure

```
mails/
└── templates/
    ├── index.js                  # Central export file
    ├── verificationEmail.js      # Email verification template
    ├── passwordResetEmail.js     # Password reset template
    └── welcomeEmail.js           # Welcome email template
```

## 🎨 Templates

### 1. Verification Email (`verificationEmail.js`)
**Purpose:** Send OTP code for email verification during registration

**Features:**
- ✅ Large, easy-to-read verification code
- ✅ Expiry notice (10 minutes)
- ✅ Security warnings
- ✅ Fully responsive design
- ✅ Modern gradient styling

**Usage:**
```javascript
const { verificationEmailTemplate } = require('./mails/templates/verificationEmail');
const html = verificationEmailTemplate('John Doe', '123456');
```

### 2. Password Reset Email (`passwordResetEmail.js`)
**Purpose:** Send password reset link with security tips

**Features:**
- ✅ Prominent reset button
- ✅ Alternative text link
- ✅ 30-minute expiry warning
- ✅ Security tips section
- ✅ "Didn't request" notice
- ✅ Mobile-optimized

**Usage:**
```javascript
const { passwordResetEmailTemplate } = require('./mails/templates/passwordResetEmail');
const html = passwordResetEmailTemplate('John Doe', 'https://example.com/reset/token123');
```

### 3. Welcome Email (`welcomeEmail.js`)
**Purpose:** Welcome new users after successful verification

**Features:**
- ✅ Role-based customization (customer, importer, exporter, supplier, buyer)
- ✅ Platform features showcase
- ✅ Call-to-action button
- ✅ Quick tips section
- ✅ Engaging design

**Usage:**
```javascript
const { welcomeEmailTemplate } = require('./mails/templates/welcomeEmail');
const html = welcomeEmailTemplate('John Doe', 'customer');
```

## 🎯 Design Features

### Responsive Design
All templates are fully responsive with breakpoints:
- **Desktop:** 600px+ (optimal viewing)
- **Tablet:** 480px - 600px (adjusted spacing)
- **Mobile:** < 480px (compact layout)

### Color Schemes
- **Verification:** Emerald/Teal gradients (`#10b981` → `#14b8a6`)
- **Password Reset:** Red warning + Teal CTA (`#ef4444` + `#14b8a6`)
- **Welcome:** Green success theme (`#10b981` → `#14b8a6`)

### Typography
- **Font Family:** System fonts for maximum compatibility
- **Headings:** Bold, large, attention-grabbing
- **Body:** Readable 16px base size
- **Mobile:** Scales down to 14px

## 🛠️ Development Features

### Console Logging
When `NODE_ENV=development`, all emails log to console:

```bash
========================================
📧 VERIFICATION EMAIL
========================================
To: user@example.com
Name: John Doe
🔐 Verification Code: 123456
⏰ Expires in: 10 minutes
========================================
```

### Email Service Configuration
Set up in `.env`:
```env
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
NODE_ENV=development
```

## 📱 Mobile Optimization

All templates automatically adjust for mobile devices:
- **Font sizes** scale down appropriately
- **Padding/spacing** reduces for smaller screens
- **Buttons** remain touch-friendly (44px+ tap targets)
- **Code/links** wrap properly to prevent overflow
- **Images** are responsive and optimized

## 🔒 Security Features

### Verification Email
- Clear expiry time (10 minutes)
- "Didn't request?" message
- No clickable links (code-based)

### Password Reset
- Prominent expiry warning (30 minutes)
- Security tips section
- "Didn't request?" alert
- Token-based link (one-time use)

## 🎨 Customization

### Changing Colors
Edit the gradient values in each template:
```javascript
gradient: 'from-emerald-500 to-teal-600'
// Change to your brand colors
gradient: 'from-blue-500 to-purple-600'
```

### Changing Branding
Update company name and logo across all templates:
```javascript
<h1>Nexarion Global Exports</h1>
// Change to
<h1>Your Company Name</h1>
```

### Adding New Templates
1. Create new file in `templates/` folder
2. Export template function
3. Add to `index.js` exports
4. Import in `config/email.js`

## 📊 Template Stats

| Template | Lines of Code | Features | Mobile Optimized |
|----------|--------------|----------|------------------|
| Verification | ~300 | OTP, Expiry, Security | ✅ |
| Password Reset | ~400 | Link, Tips, Warnings | ✅ |
| Welcome | ~350 | Role-based, CTA, Features | ✅ |

## 🚀 Best Practices

1. **Always test** emails in multiple clients (Gmail, Outlook, Apple Mail)
2. **Use inline styles** for maximum compatibility
3. **Keep images minimal** to avoid spam filters
4. **Include plain text** alternative (not implemented yet)
5. **Test on mobile** devices before deploying
6. **Use system fonts** for fast loading
7. **Avoid complex CSS** that email clients don't support

## 📝 Future Enhancements

- [ ] Add plain text versions
- [ ] Multi-language support
- [ ] A/B testing variants
- [ ] Analytics tracking
- [ ] Dark mode support
- [ ] More template variations

## 📞 Support

For issues or questions about email templates:
- Check console logs in development mode
- Verify EMAIL_USER and EMAIL_PASSWORD in `.env`
- Ensure nodemailer is properly installed
- Test with a real email address

---

**Built with ❤️ for Nexarion Global Exports**
