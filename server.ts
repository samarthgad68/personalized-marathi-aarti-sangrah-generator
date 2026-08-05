import 'dotenv/config';
import regeneratorRuntime from 'regenerator-runtime';
import express from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import multer from 'multer';
import Razorpay from 'razorpay';
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
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    const uniqueName = `user_photo_${Date.now()}_${Math.round(Math.random() * 1e6)}${ext}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (_req: express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype.startsWith('image/') || ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'].includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('फक्त प्रतिमा (Image) फॉरमॅटमधील फोटो अपलोड करा.'));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB
  fileFilter,
});

// Helper function to resolve photo path from URL or base64 data
function resolvePhotoPath(photoUrl?: string): { photoPath?: string; photoPathToDelete?: string } {
  if (!photoUrl) return {};

  if (photoUrl.includes('temp/uploads/')) {
    const filename = path.basename(photoUrl);
    const photoPath = path.join(uploadDir, filename);
    if (fs.existsSync(photoPath) && fs.statSync(photoPath).size > 0) {
      return { photoPath };
    }
  } else if (photoUrl.startsWith('data:image/')) {
    try {
      const commaIdx = photoUrl.indexOf(',');
      if (commaIdx !== -1) {
        const header = photoUrl.slice(0, commaIdx);
        const base64Data = photoUrl.slice(commaIdx + 1).replace(/\s+/g, '');

        let ext = 'jpg';
        if (header.includes('png')) ext = 'png';
        else if (header.includes('webp')) ext = 'webp';
        else if (header.includes('gif')) ext = 'gif';
        else if (header.includes('svg')) ext = 'svg';

        const buffer = Buffer.from(base64Data, 'base64');
        if (buffer.length > 0) {
          const filename = `base64_photo_${Date.now()}_${Math.round(Math.random() * 1e6)}.${ext}`;
          const photoPath = path.join(uploadDir, filename);
          fs.writeFileSync(photoPath, buffer);
          return { photoPath, photoPathToDelete: photoPath };
        }
      }
    } catch (e) {
      console.warn('Failed to parse base64 photoUrl:', e);
    }
  } else if (photoUrl.startsWith('/')) {
    const absPath = path.join(process.cwd(), photoUrl);
    if (fs.existsSync(absPath) && fs.statSync(absPath).size > 0) {
      return { photoPath: absPath };
    }
  } else if (fs.existsSync(photoUrl) && fs.statSync(photoUrl).size > 0) {
    return { photoPath: photoUrl };
  }

  return {};
}

async function startServer() {
  const app = express();

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // Static route for serving assets and temp uploads for live preview
  app.use('/assets/pages', express.static(pagesDir));
  app.use('/assets/thumbnails', express.static(thumbnailsDir));
  app.use('/assets/fonts', express.static(path.join(process.cwd(), 'assets/fonts')));
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
  app.post('/api/upload', (req, res) => {
    upload.single('photo')(req, res, (err: any) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ error: 'फोटोची साईज लहान करा (Max 25MB).' });
        }
        return res.status(400).json({ error: `अपलोड त्रुटी: ${err.message}` });
      } else if (err) {
        return res.status(400).json({ error: err.message || 'फोटो अपलोड अयशस्वी.' });
      }

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
        } catch (_razorpayErr) {
          // Live Razorpay keys missing/invalid - fallback gracefully to developer test mode
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
      const resolved = resolvePhotoPath(formData.photoUrl);
      const photoPath = resolved.photoPath;
      photoPathToDelete = resolved.photoPathToDelete || null;

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
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.send(pdfBuffer);

      // Clean up temp files when response finishes
      res.on('finish', () => {
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
        }, 5000);
      });
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
      const resolved = resolvePhotoPath(formData.photoUrl);
      const photoPath = resolved.photoPath;
      photoPathToDelete = resolved.photoPathToDelete || null;

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
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.send(pdfBuffer);

      // Clean up temp files when response finishes
      res.on('finish', () => {
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
        }, 5000);
      });
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
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      if (req.path.startsWith('/api/')) {
        return res.status(404).json({ error: 'API route not found' });
      }
      const indexPath = path.join(distPath, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(404).send('Application build not found.');
      }
    });
  }

  const PORT = 3000;

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
