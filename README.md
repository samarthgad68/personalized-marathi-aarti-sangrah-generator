# Personalized Marathi Aarti Sangrah PDF Generator (५२ पानांचा वैयक्तिकृत आरती संग्रह)

A production-ready mobile-first web application for generating personalized 52-page Marathi Aarti Sangrah PDF booklets with custom business branding, live instant preview, photo upload, and Razorpay payment integration.

---

## 🌟 Key Features

1. **Traditional Spiritual UI Design**: Maroon, Saffron, Light Cream, and Gold aesthetic designed specifically for Ganeshotsav and religious occasions.
2. **52 Pages & 21 Aartis**: Complete devotional booklet covering Shri Ganesh, Shankar, Devi, Vitthal, Datta, Hanuman, Sai Baba, Swami Samarth, Mantrapushpanjali, and Pasaydan.
3. **Live Pixel-Perfect Preview**: Live rendering of `Page 1.jpg` background with personalized text overlay and uploaded user photo matching the generated PDF down to the exact pixel.
4. **Automated 52-Page High-Res PDF Engine**: Generates 300 DPI high-resolution 52-page PDF with custom branding and user photo on every page using `pdf-lib`.
5. **Secure Razorpay Payment Integration**: Integrated payment checkout (`/api/payment/create-order` & `/api/payment/verify`). Automatically falls back to Developer Test Mode if keys are not configured.
6. **Automatic Server Cleanup**: Uploaded user photos and generated temporary PDF files are deleted immediately after download, ensuring 0 residual files on the server.

---

## 📁 Project Structure

```
├── assets/                  # Root artwork assets
│   ├── pages/              # 52 Page JPG templates (Page 1.jpg ... Page 52.jpg)
│   └── images/             # Emblem and brand graphics
├── public/                 # Static web assets
│   └── assets/pages/       # Publicly served artwork JPEGs & SVGs for client preview
├── server/                 # Backend server modules
│   └── pdfEngine.ts        # 52-page high-resolution PDF generation engine
├── src/                    # Frontend React application
│   ├── components/         # Modular UI components
│   │   ├── Header.tsx      # Ganpati emblem & calligraphy heading
│   │   ├── FeatureSection.tsx # 52 Pages, 21 Aarti cards grid
│   │   ├── NoteSection.tsx # Important user instructions banner
│   │   ├── FormSection.tsx # Touch-friendly personalization form & photo uploader
│   │   ├── PreviewSection.tsx # Pixel-perfect live preview engine & page viewer
│   │   ├── PaymentModal.tsx # Razorpay checkout & simulated payment
│   │   ├── Footer.tsx      # Footer branding & policy triggers
│   │   └── PolicyModal.tsx # Terms, Privacy, Refund, Disclaimer modals
│   ├── services/          # API services
│   │   └── api.ts          # Photo upload, payment order, & PDF download functions
│   ├── utils/              # Helper utilities & Marathi Aarti metadata
│   │   └── pageData.ts     # 52 Pages Aarti titles and verse details
│   ├── types.ts            # TypeScript interfaces & state definitions
│   ├── App.tsx             # Root application component
│   └── main.tsx            # App entry point
├── scripts/                # Asset creation scripts
│   └── generate_page_assets.js # Script generating Page 1 to Page 52 artwork templates
├── server.ts               # Express + Vite full-stack server
├── package.json            # npm scripts & dependencies
├── .env.example            # Environment variables manifest
├── .gitignore              # Ignored build & temp artifacts
└── README.md               # Complete project documentation
```

---

## 🚀 Quick Start & Installation Guide

### Prerequisites
- Node.js 18.x or higher
- npm 9.x or higher

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/your-username/marathi-aarti-generator.git
cd marathi-aarti-generator
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Edit `.env` to configure your credentials:
```env
# Required for Gemini AI API calls (if used)
GEMINI_API_KEY="your_gemini_api_key"

# App public hosting URL
APP_URL="http://localhost:3000"

# Razorpay Credentials (Get from https://dashboard.razorpay.com)
# Note: If left as default placeholders, the app automatically runs in Developer Test Mode!
RAZORPAY_KEY_ID="rzp_test_your_key_id"
RAZORPAY_KEY_SECRET="your_razorpay_key_secret"
```

### 3. Generate 52 Page Assets (If missing)
```bash
node scripts/generate_page_assets.js
```

### 4. Run Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:3000`.

---

## 🛠️ Build & Deployment Instructions

### Production Build
To bundle the frontend with Vite and compile the Express server with esbuild:
```bash
npm run build
```

### Production Start
To run the production server:
```bash
npm run start
```

---

## 🔒 Security & File Lifecycle

1. **Input Validation**: All form fields, phone numbers (10 digits), and photo file types (JPEG, PNG; max 5MB) are validated on client and server.
2. **Ephemeral File Storage**:
   - Photo uploaded to `temp/uploads/`
   - PDF generated in `temp/pdf/`
   - After download completes, both files are unlinked automatically from server storage.

---

## 📜 License
Apache-2.0 / Commercial Production License.
All rights reserved.
