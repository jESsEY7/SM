# Sylvia Aesthetics — Clinical Skincare & Dermatological Formulations

A full-stack clinical aesthetics and luxury cosmetic e-commerce application engineered for **Sylvia Aesthetics** (`Sylviamuchiriaesthetics.com`).

![Sylvia Aesthetics Banner](public/images/products/flagship-skin-tint.jpg)

---

## 🌟 Highlights & Features

- **Clinical Shade Studio**: Interactive melanin depth and undertone diagnostic engine with real-time digital skin calibration.
- **Flagship Second-Skin Tint**: Towering reactive hero showcase with fluid cursor and touch-tracking parallax motion.
- **Safaricom M-Pesa Daraja Integration**:
  - Instant **STK Push** prompt directly to the customer's phone.
  - **Dynamic M-Pesa QR Code** generator and Paybill fallback.
  - Asynchronous background polling and status verification.
  - Server-side callback verification with receipt generation (`NLJ148829` format).
  - Sandbox simulation controls for local development and testing.
- **Seamless Multi-Currency Engine**:
  - Primary default currency: **Kenyan Shilling (KES / Ksh)**.
  - Instant one-click currency converter (KES, USD, GBP, EUR) located conveniently on the clinical catalog.
- **Back Office Management Suite**:
  - Role-based access control (Admin / Staff).
  - Real-time revenue metrics, order dispatch management, and raw M-Pesa callback payload inspector.
  - Customer directory and user management.
- **Theme Customizer**:
  - Floating palette switcher: Linen Cream (clinical neutral default), Sylvia Gold, Cosmic Noir, and Rose Petal.

---

## 🏗️ Architecture

```
├── backend/                  # Django REST Framework backend
│   ├── accounts/             # Custom User model, JWT authentication & roles
│   ├── lumen/                # Django project settings, ASGI/WSGI, root URLs
│   ├── orders/               # Order processing, line items & shipping details
│   ├── payments/             # Safaricom Daraja M-Pesa client, callbacks & QR
│   ├── products/             # Cosmetic formulas, shade variants, categories
│   └── manage.py
├── src/                      # React 18 frontend (Vite + Tailwind CSS)
│   ├── api/                  # Axios service layer with JWT auto-refresh
│   ├── components/           # UI components, layout, Shade Studio, Catalog
│   ├── lib/                  # Cart context, Currency provider, Theme provider
│   └── pages/                # Home, Checkout, Back Office, Login
├── public/                   # Static assets, clinical photography & isolated bottles
├── netlify.toml              # Netlify SPA deployment configuration
└── package.json
```

---

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js** (v18+ recommended)
- **Python** (v3.10+ recommended)
- **Git**

### 2. Frontend Setup

```bash
# Install dependencies
npm install

# Start Vite dev server
npm run dev

# Build for production
npm run build
```
Frontend runs locally at `http://localhost:5173`.

### 3. Backend Setup

```bash
cd backend

# Create and activate virtual environment (optional)
python -m venv venv
venv\Scripts\activate   # Windows
source venv/bin/activate # macOS/Linux

# Install backend dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Seed catalog with 17 clinical products
python manage.py seed_products

# Start Django backend dev server
python manage.py runserver 127.0.0.1:8000
```
Backend API will be accessible at `http://127.0.0.1:8000/api/`.

### 4. Admin / Back Office Credentials

- **URL**: `http://localhost:5173/backoffice`
- **Email**: `jesweet@mail.com`
- **Password**: `Admin12345!`

---

## 💳 Safaricom Daraja Configuration

In `backend/.env`:
```env
SECRET_KEY=django-insecure-sylvia-aesthetics-secret-key
DEBUG=True

MPESA_ENVIRONMENT=sandbox
MPESA_CONSUMER_KEY=your_sandbox_consumer_key
MPESA_CONSUMER_SECRET=your_sandbox_consumer_secret
MPESA_SHORTCODE=174379
MPESA_PASSKEY=bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919
MPESA_CALLBACK_URL=http://127.0.0.1:8000/api/payments/mpesa/callback/
MPESA_SIMULATE=True
```

---

## 🌐 Netlify Deployment

The project includes `netlify.toml` and `public/_redirects` configured for single-page application routing.
- **Build command**: `npm run build`
- **Publish directory**: `dist`
