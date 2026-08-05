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

  try {
    (GlobalFonts as any).loadSystemFonts?.();
  } catch (err) {
    console.warn('Could not load system fonts:', err);
  }

  const fontDirs = [
    path.join(process.cwd(), 'assets/fonts'),
    path.join(process.cwd(), 'node_modules/@fontsource/noto-sans-devanagari/files'),
  ];

  for (const fontDir of fontDirs) {
    if (!fs.existsSync(fontDir)) continue;
    const files = fs.readdirSync(fontDir);
    for (const file of files) {
      if (file.endsWith('.woff') || file.endsWith('.ttf') || file.endsWith('.otf')) {
        const fullPath = path.join(fontDir, file);
        try {
          GlobalFonts.registerFromPath(fullPath, 'Noto Sans Devanagari');
          GlobalFonts.registerFromPath(fullPath, 'Mukta');
          if (file.includes('700') || file.includes('Bold') || file.includes('bold')) {
            GlobalFonts.registerFromPath(fullPath, 'NotoSansDevanagariBold');
          }
          if (file.includes('400') || file.includes('Regular') || file.includes('regular')) {
            GlobalFonts.registerFromPath(fullPath, 'NotoSansDevanagariRegular');
          }
        } catch (err) {
          // ignore duplicate or unparseable fonts
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
  // LEFT SIDE: Center Aligned 4 Text Lines (Width: 65% of 1080 = 702pt)
  const leftWidth = 702 * scale;
  const centerX = leftWidth / 2;
  const maxTextWidth = 660 * scale;

  const fontFamilyPrimary = '"Noto Sans Devanagari", "Liberation Sans", "FreeSans", "IPAGothic", sans-serif';

  // Helper function to prepare line specs and render grouped, centered text block
  const lineSpecs = [
    {
      text: data.businessName || 'नाव / व्यवसायाचे नाव',
      colorHex: '#d20202',
      fontWeight: '700',
      defaultSizePt: (data.businessName || '').length > 35 ? 53.03 : (data.businessName || '').length > 22 ? 65.02 : 81.97
    },
    {
      text: data.proprietorName || 'प्रोप्रायटर / हुद्दा',
      colorHex: '#000000',
      fontWeight: '700',
      defaultSizePt: (data.proprietorName || '').length > 35 ? 45.79 : (data.proprietorName || '').length > 22 ? 55.40 : 67.50
    },
    {
      text: data.address || 'पत्ता / इतर माहिती',
      colorHex: '#000000',
      fontWeight: '600',
      defaultSizePt: (data.address || '').length > 40 ? 41.04 : (data.address || '').length > 25 ? 48.17 : 57.78
    },
    {
      text: (data.mobileNumber ? `मो. ${data.mobileNumber}` : 'मोबाईल नंबर'),
      colorHex: '#000000',
      fontWeight: '600',
      defaultSizePt: (data.mobileNumber || '').length > 20 ? 38.45 : (data.mobileNumber || '').length > 14 ? 45.79 : 55.40
    }
  ];

  // Prepare wrapped lines and dimensions for all items
  const preparedItems = lineSpecs.map(spec => {
    const fontWeight = spec.fontWeight;
    let fontSize = spec.defaultSizePt * scale;

    const wrapText = (str: string, sz: number): string[] => {
      ctx.font = `${fontWeight} ${sz}px ${fontFamilyPrimary}`;
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

    let lines = wrapText(spec.text.trim(), fontSize);
    while (lines.some(l => ctx.measureText(l).width > maxTextWidth) && fontSize > 18 * scale) {
      fontSize -= 2 * scale;
      lines = wrapText(spec.text.trim(), fontSize);
    }

    const lineHeight = fontSize * 1.22;
    const blockHeight = lines.length * lineHeight;

    return {
      spec,
      fontWeight,
      fontSize,
      lineHeight,
      lines,
      blockHeight
    };
  });

  const interItemGap = 4.86 * scale; // Gap matching preview flex gap-[0.45cqw] (0.45% of container width)
  const totalBlockHeight = preparedItems.reduce((acc, item) => acc + item.blockHeight, 0) + interItemGap * (preparedItems.length - 1);

  // Vertically center the entire 4-line text block inside the 450pt (900px) height container
  let currentY = (height / 2) - (totalBlockHeight / 2);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  preparedItems.forEach(item => {
    ctx.fillStyle = item.spec.colorHex;
    item.lines.forEach(line => {
      ctx.font = `${item.fontWeight} ${item.fontSize}px ${fontFamilyPrimary}`;
      const lineCenterY = currentY + item.lineHeight / 2;
      ctx.fillText(line, centerX, lineCenterY);
      currentY += item.lineHeight;
    });
    currentY += interItemGap;
  });

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
      const photoStat = fs.statSync(data.photoPath);
      if (photoStat.size > 0) {
        let photoImg;
        try {
          photoImg = await loadImage(data.photoPath);
        } catch {
          // Retry reading as Buffer if path load fails
          const imgBuf = fs.readFileSync(data.photoPath);
          photoImg = await loadImage(imgBuf);
        }

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
      }
    } catch (photoErr: any) {
      console.warn('Photo image loading skipped:', photoErr?.message || photoErr);
    }
  }

  if (!photoDrawn) {
    ctx.fillStyle = '#B8860B';
    ctx.font = `bold ${26 * scale}px ${fontFamilyPrimary}`;
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
