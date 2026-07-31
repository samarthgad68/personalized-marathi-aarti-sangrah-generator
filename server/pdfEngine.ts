import fs from 'fs';
import path from 'path';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';

export interface PersonalizedData {
  businessName: string;   // Line 1: नाव / व्यवसायाचे नाव
  proprietorName: string; // Line 2: प्रोप्रायटर / हुद्दा
  address: string;        // Line 3: पत्ता / इतर माहिती
  mobileNumber: string;   // Line 4: मोबाईल नंबर
  photoPath?: string;
}

export async function generate52PagePDF(data: PersonalizedData, outputPath: string): Promise<string> {
  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);

  // Load Devanagari Marathi Font if available, or fallback gracefully
  let devanagariFont = null;
  const possibleFontPaths = [
    path.join(process.cwd(), 'public/fonts/NotoSansDevanagari-Bold.ttf'),
    path.join(process.cwd(), 'assets/fonts/NotoSansDevanagari-Bold.ttf')
  ];

  for (const fpath of possibleFontPaths) {
    if (fs.existsSync(fpath)) {
      try {
        const fontBytes = fs.readFileSync(fpath);
        devanagariFont = await pdfDoc.embedFont(fontBytes);
        break;
      } catch (err) {
        console.warn('Could not embed custom Devanagari font, using standard fonts:', err);
      }
    }
  }

  const standardFontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const standardFontReg = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // Load uploaded photo if exists
  let embeddedPhoto = null;
  if (data.photoPath && fs.existsSync(data.photoPath)) {
    try {
      const photoBytes = fs.readFileSync(data.photoPath);
      if (data.photoPath.toLowerCase().endsWith('.png')) {
        embeddedPhoto = await pdfDoc.embedPng(photoBytes);
      } else {
        embeddedPhoto = await pdfDoc.embedJpg(photoBytes);
      }
    } catch (photoErr) {
      console.warn('Could not embed photo, continuing without photo:', photoErr);
    }
  }

  // Iterate exactly 52 pages
  for (let pageNum = 1; pageNum <= 52; pageNum++) {
    // Page dimensions: 1080 x 1920 pt (High Resolution 9:16)
    const page = pdfDoc.addPage([1080, 1920]);
    const { width, height } = page.getSize();

    // Load corresponding background page image (Page 1.jpg .. Page 52.jpg)
    const bgPaths = [
      path.join(process.cwd(), `assets/pages/Page ${pageNum}.jpg`),
      path.join(process.cwd(), `assets/pages/Page ${pageNum}.jpeg`),
      path.join(process.cwd(), `assets/pages/Page ${pageNum}.png`),
      path.join(process.cwd(), `assets/pages/Page ${pageNum}.svg`)
    ];

    let bgEmbedded = false;
    for (const bgPath of bgPaths) {
      if (fs.existsSync(bgPath)) {
        try {
          const bgBytes = fs.readFileSync(bgPath);
          if (bgPath.endsWith('.jpg') || bgPath.endsWith('.jpeg')) {
            const bgImage = await pdfDoc.embedJpg(bgBytes);
            page.drawImage(bgImage, { x: 0, y: 0, width, height });
            bgEmbedded = true;
            break;
          } else if (bgPath.endsWith('.png')) {
            const bgImage = await pdfDoc.embedPng(bgBytes);
            page.drawImage(bgImage, { x: 0, y: 0, width, height });
            bgEmbedded = true;
            break;
          }
        } catch (e) {
          // Continue
        }
      }
    }

    if (!bgEmbedded) {
      // Draw pristine default background page
      page.drawRectangle({
        x: 0,
        y: 0,
        width,
        height,
        color: rgb(0.98, 0.96, 0.93)
      });
    }

    // DRAW PERSONALIZED AREA AT BOTTOM (Height = 450px, y = 0 to 450)
    const footerY = 0;
    const footerHeight = 450;
    const footerWidth = 1080;

    // Draw Footer Background Box
    page.drawRectangle({
      x: 0,
      y: footerY,
      width: footerWidth,
      height: footerHeight,
      color: rgb(1, 0.99, 0.97)
    });

    // Top gold separator line
    page.drawLine({
      start: { x: 0, y: footerHeight },
      end: { x: footerWidth, y: footerHeight },
      color: rgb(0.83, 0.68, 0.21), // Gold
      thickness: 4
    });

    // LEFT SIDE: Center Aligned 4 Lines in (0..750) area (Center X = 375)
    const centerX = 375;
    const maxTextWidth = 690;

    // Helper to draw auto-fitted text centered
    const drawAutoFitText = (
      text: string,
      font: any,
      maxSize: number,
      minSize: number,
      yPos: number,
      textColor: ReturnType<typeof rgb>
    ) => {
      let currentSize = maxSize;
      let textWidth = font.widthOfTextAtSize(text, currentSize);

      while (textWidth > maxTextWidth && currentSize > minSize) {
        currentSize -= 1;
        textWidth = font.widthOfTextAtSize(text, currentSize);
      }

      page.drawText(text, {
        x: Math.max(15, centerX - textWidth / 2),
        y: yPos,
        size: currentSize,
        font: font,
        color: textColor
      });
    };

    // Line 1: नाव / व्यवसायाचे नाव (Maroon Color)
    const line1Text = data.businessName || 'नाव / व्यवसायाचे नाव';
    const fontLine1 = devanagariFont || standardFontBold;
    drawAutoFitText(line1Text, fontLine1, 60, 26, 310, rgb(0.73, 0.01, 0.01)); // #bc0202 Maroon

    // Line 2: प्रोप्रायटर / हुद्दा (Regular, Black)
    const line2Text = data.proprietorName || 'प्रोप्रायटर / हुद्दा';
    const fontLine2 = devanagariFont || standardFontReg;
    drawAutoFitText(line2Text, fontLine2, 46, 22, 240, rgb(0, 0, 0));

    // Line 3: पत्ता / इतर माहिती (Regular, Black)
    const line3Text = data.address || 'पत्ता / इतर माहिती';
    const fontLine3 = devanagariFont || standardFontReg;
    drawAutoFitText(line3Text, fontLine3, 38, 18, 175, rgb(0, 0, 0));

    // Line 4: मोबाईल नंबर (Regular, Black)
    const line4Text = data.mobileNumber ? `मो. ${data.mobileNumber}` : 'मोबाईल नंबर';
    const fontLine4 = devanagariFont || standardFontReg;
    drawAutoFitText(line4Text, fontLine4, 34, 18, 115, rgb(0, 0, 0));

    // RIGHT SIDE: Photo Frame (x = 750 to 1050)
    const photoBoxWidth = 280;
    const photoBoxHeight = 390;
    const photoBoxX = 760;
    const photoBoxY = 30;

    // Draw Photo Frame Border
    page.drawRectangle({
      x: photoBoxX,
      y: photoBoxY,
      width: photoBoxWidth,
      height: photoBoxHeight,
      color: rgb(0.98, 0.96, 0.93),
      borderColor: rgb(0.83, 0.68, 0.21),
      borderWidth: 3
    });

    if (embeddedPhoto) {
      const photoDims = embeddedPhoto.scaleToFit(photoBoxWidth - 10, photoBoxHeight - 10);
      const photoX = photoBoxX + (photoBoxWidth - photoDims.width) / 2;
      const photoY = photoBoxY + (photoBoxHeight - photoDims.height) / 2;

      page.drawImage(embeddedPhoto, {
        x: photoX,
        y: photoY,
        width: photoDims.width,
        height: photoDims.height
      });
    } else {
      const photoText = 'फोटो स्थान';
      const fontPhoto = devanagariFont || standardFontBold;
      const photoTextWidth = fontPhoto.widthOfTextAtSize(photoText, 22);
      page.drawText(photoText, {
        x: photoBoxX + (photoBoxWidth - photoTextWidth) / 2,
        y: photoBoxY + photoBoxHeight / 2 - 10,
        size: 22,
        font: fontPhoto,
        color: rgb(0.7, 0.5, 0.2)
      });
    }
  }

  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(outputPath, pdfBytes);
  return outputPath;
}
