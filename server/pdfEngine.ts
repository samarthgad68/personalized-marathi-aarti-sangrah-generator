import regeneratorRuntime from 'regenerator-runtime';
import fs from 'fs';
import path from 'path';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';

if (typeof globalThis !== 'undefined') {
  (globalThis as any).regeneratorRuntime = regeneratorRuntime;
}
if (typeof global !== 'undefined') {
  (global as any).regeneratorRuntime = regeneratorRuntime;
}

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

  // Load Devanagari Marathi Fonts (Bold and Regular)
  let devanagariFontBold = null;
  let devanagariFontRegular = null;

  const boldFontPaths = [
    path.join(process.cwd(), 'assets/fonts/Mukta-Bold.ttf'),
    path.join(process.cwd(), 'assets/fonts/NotoSansDevanagari-Bold.ttf'),
    path.join(process.cwd(), 'public/fonts/NotoSansDevanagari-Bold.ttf')
  ];
  for (const fpath of boldFontPaths) {
    if (fs.existsSync(fpath)) {
      try {
        const fontBytes = fs.readFileSync(fpath);
        devanagariFontBold = await pdfDoc.embedFont(fontBytes);
        break;
      } catch (err) {
        console.warn('Could not embed custom Devanagari Bold font:', err);
      }
    }
  }

  const regFontPaths = [
    path.join(process.cwd(), 'assets/fonts/Mukta-Regular.ttf'),
    path.join(process.cwd(), 'assets/fonts/RozhaOne-Regular.ttf'),
    path.join(process.cwd(), 'assets/fonts/NotoSansDevanagari-Regular.ttf'),
    path.join(process.cwd(), 'public/fonts/NotoSansDevanagari-Regular.ttf')
  ];
  for (const fpath of regFontPaths) {
    if (fs.existsSync(fpath)) {
      try {
        const fontBytes = fs.readFileSync(fpath);
        devanagariFontRegular = await pdfDoc.embedFont(fontBytes);
        break;
      } catch (err) {
        console.warn('Could not embed custom Devanagari Regular font:', err);
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

    // LEFT SIDE: Center Aligned 4 Lines in (0..710) area (Center X = 345)
    const centerX = 345;
    const maxTextWidth = 620;

    // Helper to draw auto-fitted text centered
    const drawAutoFitText = (
      text: string,
      font: any,
      maxSize: number,
      minSize: number,
      yPos: number,
      textColor: ReturnType<typeof rgb>
    ) => {
      if (!text) return;

      // Word wrapping helper if text length exceeds available width
      const wrapText = (str: string, sz: number): string[] => {
        const words = str.split(' ');
        const lines: string[] = [];
        let currentLine = '';

        for (const word of words) {
          const testLine = currentLine ? `${currentLine} ${word}` : word;
          let testWidth = 0;
          try {
            testWidth = font.widthOfTextAtSize(testLine, sz);
          } catch (e) {
            testWidth = testLine.length * sz * 0.65;
          }

          if (testWidth <= maxTextWidth || !currentLine) {
            currentLine = testLine;
          } else {
            lines.push(currentLine);
            currentLine = word;
          }
        }
        if (currentLine) lines.push(currentLine);
        return lines;
      };

      let currentSize = maxSize;
      let lines = text.split('\n').flatMap(s => wrapText(s.trim(), currentSize)).filter(Boolean);

      const getMaxLineWidth = (lineArr: string[], sz: number) => {
        let maxW = 0;
        for (const line of lineArr) {
          let w = 0;
          try {
            w = font.widthOfTextAtSize(line, sz);
          } catch (e) {
            w = line.length * sz * 0.65;
          }
          if (w > maxW) maxW = w;
        }
        return maxW;
      };

      while (getMaxLineWidth(lines, currentSize) > maxTextWidth && currentSize > minSize) {
        currentSize -= 1;
        lines = text.split('\n').flatMap(s => wrapText(s.trim(), currentSize)).filter(Boolean);
      }

      const lineHeight = currentSize * 1.25;
      const totalHeight = (lines.length - 1) * lineHeight;
      const startY = yPos + (totalHeight / 2);

      lines.forEach((line, index) => {
        let textWidth = 0;
        try {
          textWidth = font.widthOfTextAtSize(line, currentSize);
        } catch (e) {
          textWidth = line.length * currentSize * 0.65;
        }

        const calculatedX = centerX - textWidth / 2;
        const safeX = Math.max(20, Math.min(calculatedX, maxTextWidth));

        page.drawText(line, {
          x: safeX,
          y: startY - (index * lineHeight),
          size: currentSize,
          font: font,
          color: textColor
        });
      });
    };

    // Line 1: नाव / व्यवसायाचे नाव (Maroon Color)
    const line1Text = data.businessName || 'नाव / व्यवसायाचे नाव';
    const fontLine1 = devanagariFontBold || standardFontBold;
    drawAutoFitText(line1Text, fontLine1, 56, 22, 335, rgb(0.73, 0.01, 0.01)); // #bc0202 Maroon

    // Line 2: प्रोप्रायटर / हुद्दा (Regular/Semibold, Black)
    const line2Text = data.proprietorName || 'प्रोप्रायटर / हुद्दा';
    const fontLine2 = devanagariFontRegular || devanagariFontBold || standardFontReg;
    drawAutoFitText(line2Text, fontLine2, 42, 18, 235, rgb(0, 0, 0));

    // Line 3: पत्ता / इतर माहिती (Regular, Black)
    const line3Text = data.address || 'पत्ता / इतर माहिती';
    const fontLine3 = devanagariFontRegular || devanagariFontBold || standardFontReg;
    drawAutoFitText(line3Text, fontLine3, 34, 16, 140, rgb(0, 0, 0));

    // Line 4: मोबाईल नंबर (Regular, Black)
    const line4Text = data.mobileNumber ? `मो. ${data.mobileNumber}` : 'मोबाईल नंबर';
    const fontLine4 = devanagariFontRegular || devanagariFontBold || standardFontReg;
    drawAutoFitText(line4Text, fontLine4, 32, 16, 50, rgb(0, 0, 0));

    // RIGHT SIDE: Photo Frame (x = 720 to 1040) - Width increased 10px towards inside
    const photoBoxWidth = 320;
    const photoBoxHeight = 390;
    const photoBoxX = 720;
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
      const fontPhoto = devanagariFontBold || standardFontBold;
      let photoTextWidth = 100;
      try {
        photoTextWidth = fontPhoto.widthOfTextAtSize(photoText, 22);
      } catch (e) {
        photoTextWidth = 100;
      }
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
