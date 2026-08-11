# Nexarion Global Exports

**Enterprise Import/Export Business Management Platform**

A comprehensive full-stack web application designed for managing international import/export operations, featuring B2B client management, product catalogs, quotation systems, order processing, shipment tracking, and supplier management.

---

## 🏢 Project Overview

Nexarion Global Exports is a production-grade business management platform built for the international trade industry. The platform serves as a centralized hub for managing all aspects of import/export operations including:

- **Client Portal** - B2B customer registration, product browsing, quote requests
- **Admin Dashboard** - Complete business operations management with 2FA authentication
- **Supplier Portal** - Supplier registration, product management, order fulfillment

---

## 🛠️ Tech Stack

### Frontend
- **React 18** with Vite for fast development and optimized builds
- **Tailwind CSS** for responsive, modern UI design
- **Redux Toolkit** for state management
- **React Router v6** for client-side routing
- **React Hot Toast** for notifications
- **Lucide React** for consistent iconography

### Backend
- **Node.js** with Express.js framework
- **MongoDB** with Mongoose ODM
- **JWT** for authentication with refresh token rotation
- **Nodemailer** for transactional emails
- **Cloudinary** for image/file management
- **Stripe** for payment processing
- **Multer** for file uploads

### Security Features
- Two-Factor Authentication (2FA) for admin access
- Password hashing with bcrypt
- Rate limiting and CORS protection
- Input validation and sanitization
- Secure HTTP headers

---

## ✨ Key Features

### Public Website
- Modern, responsive landing page
- Product catalog with advanced filtering
- Company information and services
- Contact form with email notifications

### Client Portal
- User registration with email verification
- Product browsing and search
- Quote request system
- Order history and tracking
- Profile management

### Admin Dashboard
- **Secure 2FA Login** - OTP verification via email
- **Dashboard Analytics** - Revenue, orders, user statistics
- **Product Management** - Full CRUD with image uploads
- **Order Management** - Status updates, invoicing
- **User Management** - Client/supplier administration
- **Inventory Control** - Stock tracking, low stock alerts
- **Shipment Tracking** - Logistics management
- **Support Tickets** - Customer service system
- **Reports** - PDF generation, scheduled reports

### Supplier Portal
- Supplier registration and verification
- Product listing management
- Order fulfillment workflow
- Performance analytics

---

## 📁 Project Structure

```
IMPORT_EXPORT/
├── client/                 # React frontend application
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API service layer
│   │   ├── store/          # Redux store configuration
│   │   ├── hooks/          # Custom React hooks
│   │   ├── utils/          # Utility functions
│   │   └── constants/      # Application constants
│   ├── package.json
│   └── vite.config.js
│
├── server/                 # Node.js backend application
│   ├── config/             # Database, email, payment configs
│   ├── controllers/        # Request handlers
│   ├── middleware/         # Auth, validation, error handling
│   ├── models/             # MongoDB schemas
│   ├── routes/             # API route definitions
│   ├── mails/              # Email templates
│   ├── utils/              # Helper utilities
│   ├── server.js           # Application entry point
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+ 
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd IMPORT_EXPORT
   ```

2. **Install server dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install client dependencies**
   ```bash
   cd ../client
   npm install
   ```

4. **Configure environment variables**
   
   Create `.env` files in both `server/` and `client/` directories using the templates below.

5. **Start development servers**

   Server (from `/server`):
   ```bash
   npm run dev
   ```

   Client (from `/client`):
   ```bash
   npm run dev
   ```

---

## ⚙️ Environment Variables

### Server (`server/.env`)

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=your_mongodb_connection_string

# JWT Authentication
JWT_SECRET=your_jwt_secret_key
JWT_REFRESH_SECRET=your_refresh_token_secret
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d

# Email Configuration (Gmail/SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=your_email@gmail.com

# Cloudinary (Image Storage)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Stripe (Payments)
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret

# Frontend URL (for CORS)
CLIENT_URL=http://localhost:5173
```

### Client (`client/.env`)

```env
VITE_BASE_URL=http://localhost:5000/api/v1
VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key
```

---

## 🌐 Deployment

### Vercel Deployment

**Frontend (Client)**
1. Connect your GitHub repository to Vercel
2. Set root directory to `client`
3. Build command: `npm run build`
4. Output directory: `dist`
5. Add environment variables in Vercel dashboard

**Backend (Server)**
1. Create separate Vercel project for backend
2. Set root directory to `server`
3. Add `vercel.json` configuration
4. Add environment variables in Vercel dashboard

### Production Checklist
- [ ] Set `NODE_ENV=production`
- [ ] Configure production MongoDB (Atlas recommended)
- [ ] Set up Cloudinary production account
- [ ] Configure production Stripe keys
- [ ] Enable rate limiting
- [ ] Set secure CORS origins
- [ ] Configure SSL/HTTPS

---

## 🔐 Security Notes

This is a **private repository** containing proprietary business logic for Nexarion Global Exports.

- Never commit `.env` files or expose API keys
- Admin access requires 2FA verification
- All sensitive routes are protected with JWT authentication
- Regular security audits recommended
- Keep dependencies updated

---

## 👥 Team Access

Repository access is restricted to authorized team members only. Contact the repository owner for access requests.

---

## 📄 License

**Proprietary** - All rights reserved. Unauthorized copying, modification, or distribution is prohibited.

---

## 📞 Support

For technical issues or questions, contact the development team through internal channels.

---

*Last Updated: February 2026*
