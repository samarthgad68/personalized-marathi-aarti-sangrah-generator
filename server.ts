import express from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import multer from 'multer';
import Razorpay from 'razorpay';
import { createServer as createViteServer } from 'vite';
import { generate52PagePDF, PersonalizedData } from './server/pdfEngine.js';

// Ensure required directories exist
const uploadDir = path.join(process.cwd(), 'temp/uploads');
const pdfTempDir = path.join(process.cwd(), 'temp/pdf');
const pagesDir = path.join(process.cwd(), 'assets/pages');

[uploadDir, pdfTempDir, pagesDir].forEach((dir) => {
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

      // If Razorpay keys are provided, create live Razorpay order
      if (keyId && keySecret && !keyId.includes('your_key_id')) {
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

  // 4. VERIFY PAYMENT AND GENERATE PDF ENDPOINT
  app.post('/api/payment/verify', async (req, res) => {
    let pdfPath: string | null = null;
    let photoPathToDelete: string | null = null;

    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature, formData } = req.body;

      if (!formData || !formData.businessName || !formData.customerName) {
        return res.status(400).json({ error: 'कृपया सर्व आवश्यक माहिती भरा.' });
      }

      const keySecret = process.env.RAZORPAY_KEY_SECRET;

      // Verify HMAC Signature if live Razorpay keys are present
      if (keySecret && !razorpay_order_id.startsWith('order_test_')) {
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
