import regeneratorRuntime from 'regenerator-runtime';
import fs from 'fs';
import path from 'path';
import { PDFDocument, rgb } from 'pdf-lib';
import { createCanvas, GlobalFonts, loadImage } from '@napi-rs/canvas';

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

// Register Devanagari Unicode Fonts for Canvas Text Shaping
let fontsRegistered = false;

function registerFonts() {
  if (fontsRegistered) return;

  const fontFiles = [
    { name: 'NotoSansDevanagariBold', paths: ['assets/fonts/NotoSansDevanagari-Bold.ttf', 'public/fonts/NotoSansDevanagari-Bold.ttf'] },
    { name: 'NotoSansDevanagariRegular', paths: ['assets/fonts/NotoSansDevanagari-Regular.ttf', 'public/fonts/NotoSansDevanagari-Regular.ttf'] },
    { name: 'MuktaBold', paths: ['assets/fonts/Mukta-Bold.ttf'] },
    { name: 'MuktaRegular', paths: ['assets/fonts/Mukta-Regular.ttf'] },
  ];

  for (const fontItem of fontFiles) {
    for (const p of fontItem.paths) {
      const fullPath = path.isAbsolute(p) ? p : path.join(process.cwd(), p);
      if (fs.existsSync(fullPath)) {
        try {
          GlobalFonts.registerFromPath(fullPath, fontItem.name);
          break;
        } catch (err) {
          console.warn(`Could not register font ${fontItem.name} from ${fullPath}:`, err);
        }
      }
    }
  }

  fontsRegistered = true;
}

/**
 * Generates an ultra-crisp (2160x900) PNG buffer for the personalized bottom section.
 * Using Canvas + Skia + HarfBuzz guarantees 100% correct Devanagari shaping,
 * ligatures, and exact font rendering identical to the browser preview.
 */
async function renderFooterPngBuffer(data: PersonalizedData): Promise<Buffer> {
  registerFonts();

  const scale = 2; // 2x high resolution (2160 x 900) for print sharpness
  const width = 1080 * scale;
  const height = 450 * scale;

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Keep canvas background transparent so text and photo overlay cleanly on page background
  // LEFT SIDE: Center Aligned 4 Text Lines (Width: 0 to 680pt)
  const leftWidth = 680 * scale;
  const centerX = leftWidth / 2;
  const maxTextWidth = 620 * scale;

  const fontFamilyBold = 'NotoSansDevanagariBold, MuktaBold, sans-serif';
  const fontFamilyReg = 'NotoSansDevanagariRegular, MuktaRegular, sans-serif';

  // Helper function to auto-fit, word-wrap, and render centered Devanagari & English text
  const drawCenteredLine = (
    text: string,
    defaultSizePt: number,
    isBold: boolean,
    colorHex: string,
    centerYPt: number
  ) => {
    if (!text) return;

    const fontFam = isBold ? fontFamilyBold : fontFamilyReg;
    const fontWeight = isBold ? 'bold' : '600';
    let fontSize = defaultSizePt * scale;

    const wrapText = (str: string, sz: number): string[] => {
      ctx.font = `${fontWeight} ${sz}px ${fontFam}`;
      const words = str.split(' ');
      const lines: string[] = [];
      let currentLine = '';

      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        if (ctx.measureText(testLine).width <= maxTextWidth || !currentLine) {
          currentLine = testLine;
        } else {
          lines.push(currentLine);
          currentLine = word;
        }
      }
      if (currentLine) lines.push(currentLine);
      return lines;
    };

    let lines = wrapText(text.trim(), fontSize);
    while (lines.some(l => ctx.measureText(l).width > maxTextWidth) && fontSize > 18 * scale) {
      fontSize -= 2 * scale;
      lines = wrapText(text.trim(), fontSize);
    }

    ctx.fillStyle = colorHex;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const lineHeight = fontSize * 1.25;
    const totalHeight = lines.length * lineHeight;
    let currentY = (centerYPt * scale) - (totalHeight / 2) + (lineHeight / 2);

    lines.forEach((line) => {
      ctx.font = `${fontWeight} ${fontSize}px ${fontFam}`;
      ctx.fillText(line, centerX, currentY);
      currentY += lineHeight;
    });
  };

  // Line 1: नाव / व्यवसायाचे नाव (#d20202, Bold) - Center Y: 90pt
  const line1Text = data.businessName || 'नाव / व्यवसायाचे नाव';
  drawCenteredLine(line1Text, 52, true, '#d20202', 90);

  // Line 2: प्रोप्रायटर / हुद्दा (Black, Bold) - Center Y: 185pt
  const line2Text = data.proprietorName || 'प्रोप्रायटर / हुद्दा';
  drawCenteredLine(line2Text, 42, true, '#000000', 185);

  // Line 3: पत्ता / इतर माहिती (Black, SemiBold) - Center Y: 270pt
  const line3Text = data.address || 'पत्ता / इतर माहिती';
  drawCenteredLine(line3Text, 36, false, '#000000', 270);

  // Line 4: मोबाईल नंबर (Black, SemiBold) - Center Y: 355pt
  const line4Text = data.mobileNumber ? `मो. ${data.mobileNumber}` : 'मोबाईल नंबर';
  drawCenteredLine(line4Text, 34, false, '#000000', 355);

  // RIGHT SIDE: Photo Frame Box (X = 710 to 1040, Y = 30 to 420)
  const pX = 710 * scale;
  const pY = 30 * scale;
  const pW = 330 * scale;
  const pH = 390 * scale;

  ctx.fillStyle = '#FAF6EE';
  ctx.fillRect(pX, pY, pW, pH);

  ctx.strokeStyle = '#D4AF37';
  ctx.lineWidth = 3 * scale;
  ctx.strokeRect(pX, pY, pW, pH);

  let photoDrawn = false;
  if (data.photoPath && fs.existsSync(data.photoPath)) {
    try {
      const photoImg = await loadImage(data.photoPath);
      const margin = 8 * scale;
      const targetW = pW - margin * 2;
      const targetH = pH - margin * 2;

      const factor = Math.min(targetW / photoImg.width, targetH / photoImg.height);
      const drawW = photoImg.width * factor;
      const drawH = photoImg.height * factor;
      const drawX = pX + margin + (targetW - drawW) / 2;
      const drawY = pY + margin + (targetH - drawH) / 2;

      ctx.drawImage(photoImg, drawX, drawY, drawW, drawH);
      photoDrawn = true;
    } catch (photoErr) {
      console.warn('Could not load photo into canvas:', photoErr);
    }
  }

  if (!photoDrawn) {
    ctx.fillStyle = '#B8860B';
    ctx.font = `bold ${26 * scale}px ${fontFamilyBold}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('फोटो स्थान', pX + pW / 2, pY + pH / 2);
  }

  return canvas.toBuffer('image/png');
}

export async function generate52PagePDF(data: PersonalizedData, outputPath: string): Promise<string> {
  const pdfDoc = await PDFDocument.create();

  // Generate the high-resolution shaped footer image
  const footerPngBuffer = await renderFooterPngBuffer(data);
  const footerImage = await pdfDoc.embedPng(footerPngBuffer);

  // Iterate exactly 52 pages
  for (let pageNum = 1; pageNum <= 52; pageNum++) {
    // Page dimensions: 1080 x 1920 pt (High Resolution 9:16)
    const page = pdfDoc.addPage([1080, 1920]);
    const { width, height } = page.getSize();

    // Load corresponding background page image (Page 1.jpg .. Page 52.jpg / Page 01.jpg .. Page 52.jpg)
    const pagePadded = pageNum < 10 ? `0${pageNum}` : `${pageNum}`;
    const bgPaths = [
      path.join(process.cwd(), `assets/pages/Page ${pageNum}.jpg`),
      path.join(process.cwd(), `assets/pages/Page ${pagePadded}.jpg`),
      path.join(process.cwd(), `assets/pages/Page ${pageNum}.jpeg`),
      path.join(process.cwd(), `assets/pages/Page ${pagePadded}.jpeg`),
      path.join(process.cwd(), `assets/pages/Page ${pageNum}.png`),
      path.join(process.cwd(), `assets/pages/Page ${pagePadded}.png`)
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
      // Draw default background page
      page.drawRectangle({
        x: 0,
        y: 0,
        width,
        height,
        color: rgb(0.98, 0.96, 0.93)
      });
    }

    // DRAW PERSONALIZED AREA AT BOTTOM (Height = 450px, Y = 0 to 450)
    page.drawImage(footerImage, {
      x: 0,
      y: 0,
      width: 1080,
      height: 450
    });
  }

  const pdfBytes = await pdfDoc.save();

  // Ensure output directory exists
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(outputPath, pdfBytes);
  return outputPath;
}
