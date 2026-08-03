import regeneratorRuntime from 'regenerator-runtime';
import express from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import multer from 'multer';
import Razorpay from 'razorpay';
import { createServer as createViteServer } from 'vite';
import { generate52PagePDF, PersonalizedData } from './server/pdfEngine.js';

if (typeof globalThis !== 'undefined') {
  (globalThis as any).regeneratorRuntime = regeneratorRuntime;
}
if (typeof global !== 'undefined') {
  (global as any).regeneratorRuntime = regeneratorRuntime;
}

// Ensure required directories exist
const uploadDir = path.join(process.cwd(), 'temp/uploads');
const pdfTempDir = path.join(process.cwd(), 'temp/pdf');
const pagesDir = path.join(process.cwd(), 'assets/pages');
const thumbnailsDir = path.join(process.cwd(), 'assets/thumbnails');

[uploadDir, pdfTempDir, pagesDir, thumbnailsDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Setup Multer Storage with validation
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueName = `user_photo_${Date.now()}_${Math.round(Math.random() * 1e6)}${ext}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (_req: express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('फक्त JPG, JPEG किंवा PNG फॉरमॅटमधील फोटो अपलोड करा.'));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter,
});

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || '3000', 10);

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Static route for serving assets and temp uploads for live preview
  app.use('/assets/pages', express.static(path.join(process.cwd(), 'assets/pages')));
  app.use('/assets', express.static(path.join(process.cwd(), 'assets')));
  app.use('/temp/uploads', express.static(uploadDir));

  // 1. HEALTHCHECK ENDPOINT
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      razorpayConfigured: !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET),
    });
  });

  // 2. PHOTO UPLOAD ENDPOINT
  app.post('/api/upload', upload.single('photo'), (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'कृपया फोटो निवडा.' });
      }
      const photoUrl = `/temp/uploads/${req.file.filename}`;
      const photoPath = req.file.path;

      res.json({
        success: true,
        photoUrl,
        photoPath,
        filename: req.file.filename,
      });
    } catch (error: any) {
      console.error('Upload error:', error);
      res.status(500).json({ error: error.message || 'फोटो अपलोड अयशस्वी.' });
    }
  });

  // 3. CREATE RAZORPAY ORDER ENDPOINT
  app.post('/api/payment/create-order', async (req, res) => {
    try {
      const keyId = process.env.RAZORPAY_KEY_ID;
      const keySecret = process.env.RAZORPAY_KEY_SECRET;

      // Price: ₹99 = 9900 paise
      const amount = 9900;
      const currency = 'INR';

      // If Razorpay keys are provided, attempt to create live Razorpay order
      if (keyId && keySecret && !keyId.includes('your_key_id')) {
        try {
          const instance = new Razorpay({
            key_id: keyId,
            key_secret: keySecret,
          });

          const order = await instance.orders.create({
            amount,
            currency,
            receipt: `rcpt_aarti_${Date.now()}`,
            notes: {
              purpose: 'Personalized Marathi Aarti Sangrah PDF',
            },
          });

          return res.json({
            success: true,
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            keyId,
            isTestMode: false,
          });
        } catch (razorpayErr: any) {
          console.warn('Razorpay live order creation failed (invalid keys or network error, falling back to test mode):', razorpayErr?.error || razorpayErr);
        }
      }

      // Fallback Test Mode when keys are missing or placeholders
      const testOrderId = `order_test_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
      return res.json({
        success: true,
        orderId: testOrderId,
        amount,
        currency,
        keyId: 'rzp_test_mode_demo',
        isTestMode: true,
        message: 'Developer test mode active. Payment simulated automatically.',
      });
    } catch (error: any) {
      console.error('Razorpay order error:', error);
      res.status(500).json({ error: error.message || 'पेमेंट ऑर्डर तयार करण्यात अडचण आली.' });
    }
  });

  // In-memory store for verified payment sessions
  const paidSessions = new Map<string, { createdAt: number; orderId: string; paymentId: string }>();

  // Clean up old sessions (> 24 hours)
  setInterval(() => {
    const now = Date.now();
    for (const [token, data] of paidSessions.entries()) {
      if (now - data.createdAt > 24 * 60 * 60 * 1000) {
        paidSessions.delete(token);
      }
    }
  }, 60 * 60 * 1000);

  // 4. VERIFY PAYMENT SESSION (HOME PAGE -> GENERATOR PAGE REDIRECT)
  app.post('/api/payment/verify-session', (req, res) => {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
      const keySecret = process.env.RAZORPAY_KEY_SECRET;

      // Verify HMAC Signature if live Razorpay keys are present and not test mode
      if (keySecret && razorpay_order_id && !razorpay_order_id.startsWith('order_test_')) {
        const body = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSignature = crypto
          .createHmac('sha256', keySecret)
          .update(body.toString())
          .digest('hex');

        if (expectedSignature !== razorpay_signature) {
          return res.status(400).json({ error: 'पेमेंट व्हॅलिडेशन अयशस्वी झाले.' });
        }
      }

      // Generate secure session token
      const sessionToken = `aarti_sess_${Date.now()}_${crypto.randomBytes(12).toString('hex')}`;
      paidSessions.set(sessionToken, {
        createdAt: Date.now(),
        orderId: razorpay_order_id || 'test_order',
        paymentId: razorpay_payment_id || 'test_payment',
      });

      return res.json({
        success: true,
        sessionToken,
        message: 'पेमेंट यशस्वी! सेशन तयार झाले.',
      });
    } catch (error: any) {
      console.error('Verify session error:', error);
      res.status(500).json({ error: error.message || 'पेमेंट पडताळणीमध्ये त्रुटी आली.' });
    }
  });

  // 5. GENERATE AND DOWNLOAD PDF ENDPOINT (GENERATOR PAGE)
  app.post('/api/pdf/generate', async (req, res) => {
    let pdfPath: string | null = null;
    let photoPathToDelete: string | null = null;

    try {
      const { sessionToken, razorpay_order_id, razorpay_payment_id, razorpay_signature, formData } = req.body;

      if (!formData || !formData.businessName) {
        return res.status(400).json({ error: 'कृपया सर्व आवश्यक माहिती भरा.' });
      }

      // Validate via sessionToken OR Razorpay payment
      let isValid = false;

      if (sessionToken && paidSessions.has(sessionToken)) {
        isValid = true;
      } else {
        const keySecret = process.env.RAZORPAY_KEY_SECRET;
        if (keySecret && razorpay_order_id && !razorpay_order_id.startsWith('order_test_')) {
          const body = razorpay_order_id + '|' + razorpay_payment_id;
          const expectedSignature = crypto
            .createHmac('sha256', keySecret)
            .update(body.toString())
            .digest('hex');

          if (expectedSignature === razorpay_signature) {
            isValid = true;
          }
        } else {
          // Test mode or direct allowed when test order
          isValid = true;
        }
      }

      if (!isValid) {
        return res.status(403).json({ error: 'पेमेंट सेशन वैध नाही. कृपया प्रथम ₹99 पेमेंट करा.' });
      }

      // Photo path
      let photoPath: string | undefined = undefined;
      if (formData.photoUrl && formData.photoUrl.startsWith('/temp/uploads/')) {
        const filename = path.basename(formData.photoUrl);
        photoPath = path.join(uploadDir, filename);
        photoPathToDelete = photoPath;
      }

      const pdfData: PersonalizedData = {
        businessName: formData.businessName,
        proprietorName: formData.proprietorName || '',
        address: formData.address || '',
        mobileNumber: formData.mobileNumber || '',
        photoPath,
      };

      // Generate PDF
      const pdfFileName = `aarti_sangrah_${Date.now()}.pdf`;
      pdfPath = path.join(pdfTempDir, pdfFileName);

      await generate52PagePDF(pdfData, pdfPath);

      // Read file and send stream
      const pdfBuffer = fs.readFileSync(pdfPath);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Length', pdfBuffer.length.toString());
      res.setHeader('Content-Disposition', 'attachment; filename="Personalized_Marathi_Aarti_Sangrah.pdf"');
      res.send(pdfBuffer);

      // IMMEDIATE CLEANUP OF TEMP FILES
      setTimeout(() => {
        if (pdfPath && fs.existsSync(pdfPath)) {
          try {
            fs.unlinkSync(pdfPath);
          } catch (e) {}
        }
        if (photoPathToDelete && fs.existsSync(photoPathToDelete)) {
          try {
            fs.unlinkSync(photoPathToDelete);
          } catch (e) {}
        }
      }, 2000);
    } catch (error: any) {
      console.error('PDF Generation error:', error);

      if (pdfPath && fs.existsSync(pdfPath)) {
        try {
          fs.unlinkSync(pdfPath);
        } catch (e) {}
      }

      res.status(500).json({ error: error.message || 'PDF निर्मितीमध्ये त्रुटी आली.' });
    }
  });

  // 6. VERIFY PAYMENT AND GENERATE PDF ENDPOINT (BACKWARD COMPATIBLE)
  app.post('/api/payment/verify', async (req, res) => {
    let pdfPath: string | null = null;
    let photoPathToDelete: string | null = null;

    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature, formData } = req.body;

      if (!formData || !formData.businessName) {
        return res.status(400).json({ error: 'कृपया सर्व आवश्यक माहिती भरा.' });
      }

      const keySecret = process.env.RAZORPAY_KEY_SECRET;

      // Verify HMAC Signature if live Razorpay keys are present
      if (keySecret && razorpay_order_id && !razorpay_order_id.startsWith('order_test_')) {
        const body = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSignature = crypto
          .createHmac('sha256', keySecret)
          .update(body.toString())
          .digest('hex');

        if (expectedSignature !== razorpay_signature) {
          return res.status(400).json({ error: 'पेमेंट व्हॅलिडेशन अयशस्वी झाले.' });
        }
      }

      // Photo path
      let photoPath: string | undefined = undefined;
      if (formData.photoUrl && formData.photoUrl.startsWith('/temp/uploads/')) {
        const filename = path.basename(formData.photoUrl);
        photoPath = path.join(uploadDir, filename);
        photoPathToDelete = photoPath;
      }

      const pdfData: PersonalizedData = {
        businessName: formData.businessName,
        proprietorName: formData.proprietorName || '',
        address: formData.address || '',
        mobileNumber: formData.mobileNumber || '',
        photoPath,
      };

      // Generate PDF
      const pdfFileName = `aarti_sangrah_${Date.now()}.pdf`;
      pdfPath = path.join(pdfTempDir, pdfFileName);

      await generate52PagePDF(pdfData, pdfPath);

      // Read file and send stream
      const pdfBuffer = fs.readFileSync(pdfPath);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Length', pdfBuffer.length.toString());
      res.setHeader('Content-Disposition', 'attachment; filename="Personalized_Marathi_Aarti_Sangrah.pdf"');
      res.send(pdfBuffer);

      // IMMEDIATE CLEANUP OF TEMP FILES (Upload Photo + Generated PDF)
      setTimeout(() => {
        if (pdfPath && fs.existsSync(pdfPath)) {
          try {
            fs.unlinkSync(pdfPath);
          } catch (e) {}
        }
        if (photoPathToDelete && fs.existsSync(photoPathToDelete)) {
          try {
            fs.unlinkSync(photoPathToDelete);
          } catch (e) {}
        }
      }, 2000);
    } catch (error: any) {
      console.error('PDF Generation / Payment Verification error:', error);

      // Clean up on error
      if (pdfPath && fs.existsSync(pdfPath)) {
        try {
          fs.unlinkSync(pdfPath);
        } catch (e) {}
      }

      res.status(500).json({ error: error.message || 'PDF निर्मितीमध्ये त्रुटी आली.' });
    }
  });

  // VITE OR STATIC SERVER MIDDLEWARE
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
