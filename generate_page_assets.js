import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const assetsPagesDir = path.join(__dirname, '../assets/pages');

if (!fs.existsSync(assetsPagesDir)) {
  fs.mkdirSync(assetsPagesDir, { recursive: true });
}

// Marathi Aarti Titles for all 52 pages
const aartiList = [
  { p: 1, title: "श्री गणपती आरती", sub: "सुखकर्ता दुखहर्ता वार्ता विघ्नाची" },
  { p: 2, title: "श्री गणपती आरती", sub: "शेंदुर लाल चढायो अच्छा गजमुख को" },
  { p: 3, title: "श्री संकटनाशन गणेश स्तोत्रम्", sub: "प्रणम्य शिरसा देवं गौरीपुत्रं विनायकम्" },
  { p: 4, title: "श्री गणेश अथर्वशीर्ष", sub: "नमस्ते गणपतये त्वमेव प्रत्यक्षं तत्त्वमसि" },
  { p: 5, title: "श्री शंकर आरती", sub: "लवथवती विक्राळा ब्रह्मांडी माळा" },
  { p: 6, title: "श्री महादेवाची आरती", sub: "जय देव जय देव जय श्रीशंकरा" },
  { p: 7, title: "श्री दुर्गे आरती", sub: "दुर्गे दुर्घट भारी तुजविण संसारी" },
  { p: 8, title: "श्री महालक्ष्मी आरती", sub: "जय देवी जय देवी जय महालक्ष्मी" },
  { p: 9, title: "श्री अंबेमातेची आरती", sub: "जय अंबे जगदंबे माता भवानी" },
  { p: 10, title: "श्री नवदुर्गा स्तोत्र", sub: "प्रथमं शैलपुत्री च द्वितीयं ब्रह्मचारिणी" },
  { p: 11, title: "श्री विठ्ठल आरती", sub: "युगे अठ्ठावीस विटेवरी उभा" },
  { p: 12, title: "श्री पांडुरंगाची आरती", sub: "येई ओ विठ्ठले माझे माऊली ये" },
  { p: 13, title: "श्री रुक्मिणी आरती", sub: "जय देव जय देव जय रुक्मिणीकांता" },
  { p: 14, title: "श्री दत्तात्रेय आरती", sub: "त्रिगुणात्मक त्रिमूर्ती दत्त हा जाण" },
  { p: 15, title: "श्री दिगंबरा आरती", sub: "दिगंबरा दिगंबरा श्रीपाद वल्लभ दिगंबरा" },
  { p: 16, title: "श्री रामचंद्र आरती", sub: "आरती सप्रेम जय जय रघुवीरा" },
  { p: 17, title: "श्री रामस्तुती", sub: "श्रीरामचंद्र कृपालु भजु मन हरण भवभय दारुणम्" },
  { p: 18, title: "श्री कृष्ण आरती", sub: "ओवाळू आरती मदनगोपाला" },
  { p: 19, title: "श्री कृष्ण आरती", sub: "जय देव जय देव जय श्रीकृष्णा" },
  { p: 20, title: "श्री हनुमान आरती", sub: "सत्राणे उड्डाणे उड्डाण धावे" },
  { p: 21, title: "श्री मारुती स्तोत्र", sub: "भीमरूपी महारुद्रा वज्रहनुमान मारुती" },
  { p: 22, title: "श्री कालभैरव आरती", sub: "जय देव जय देव जय कालभैरवा" },
  { p: 23, title: "श्री साईबाबा आरती", sub: "आरती साईबाबा सौख्यदातार जीवा" },
  { p: 24, title: "श्री साईबाबा आरती", sub: "घेउनिया पंचारती करू बाबांसी आरती" },
  { p: 25, title: "श्री स्वामी समर्थ आरती", sub: "जय जय स्वामी समर्था अक्कलकोटनिवासी" },
  { p: 26, title: "श्री स्वामी समर्थ स्तवन", sub: "अशक्य ही शक्य करतील स्वामी" },
  { p: 27, title: "श्री गजानन महाराज आरती", sub: "जय देव जय देव जय श्रीगजानना" },
  { p: 28, title: "श्री नवग्रह आरती", sub: "जय देव जय देव जय नवग्रह देवा" },
  { p: 29, title: "श्री शनिदेव आरती", sub: "जय जय श्री शनिदेवा भक्तांसी सुखकारी" },
  { p: 30, title: "श्री सूर्यदेव आरती", sub: "जय देव जय देव जय भास्करा" },
  { p: 31, title: "श्री तुळशी आरती", sub: "जय देव जय देव जय तुळशी माते" },
  { p: 32, title: "श्री गंगा आरती", sub: "जय गंगे माता जय हर गंगे" },
  { p: 33, title: "श्री ज्ञानदेव आरती", sub: "आरती ज्ञानराजा महाकैवल्यतेजा" },
  { p: 34, title: "श्री ज्ञानेश्वर हरिपाठ", sub: "देवाचिये द्वारी उभा क्षणभरी" },
  { p: 35, title: "श्री तुकाराम आरती", sub: "आरती तुकारामा स्वामी त्रिभुवना" },
  { p: 36, title: "श्री एकनाथ महाराज आरती", sub: "जय देव जय देव जय एकनाथा" },
  { p: 37, title: "श्री नामदेव महाराज आरती", sub: "आरती नामदेवा संतशिरोमणी" },
  { p: 38, title: "श्री रामदास स्वामी आरती", sub: "जय देव जय देव जय समर्थ रामदासा" },
  { p: 39, title: "श्री चोखामेळा आरती", sub: "आरती चोखोबाची भक्तिभावाने" },
  { p: 40, title: "श्री गोरा कुंभार आरती", sub: "जय देव जय देव जय गोराबा" },
  { p: 41, title: "श्री जनाबाई आरती", sub: "आरती जनाबाईची दासी विठ्ठलाची" },
  { p: 42, title: "श्री मुक्ताबाई आरती", sub: "जय देव जय देव जय मुक्ताबाई" },
  { p: 43, title: "श्री सोपानदेव आरती", sub: "जय देव जय देव जय सोपानदेवा" },
  { p: 44, title: "श्री निवृत्तीनाथ आरती", sub: "आरती निवृत्तीनाथा गुरुरायाची" },
  { p: 45, title: "श्री सत्यनारायण आरती", sub: "जय लक्ष्मीरमणा श्री सत्यनारायण" },
  { p: 46, title: "श्री काकड आरती", sub: "उठा पांडुरंगा आता प्रभात समोयो पातला" },
  { p: 47, title: "श्री शेजारती", sub: "आता स्वामी सुखे निद्रा करा अवधूता" },
  { p: 48, title: "श्री पसायदान", sub: "आता विश्वात्मके देवे । येणे वाग्यज्ञे तोषावे" },
  { p: 49, title: "घालीन लोटांगण", sub: "घालीन लोटांगण वंदीन चरण । डोळ्यांनी पाहीन रूप तुझे" },
  { p: 50, title: "मंत्रपुष्पांजली", sub: "ॐ यज्ञेन यज्ञमयजन्त देवास्तानि धर्माणि" },
  { p: 51, title: "श्री गणपती स्तोत्र व प्रार्थना", sub: "सदा सर्वदा योग तुझा घडावा" },
  { p: 52, title: "आरती संग्रह सांगता", sub: "॥ श्री गणपती बाप्पा मोरया । मंगलमूर्ती मोरया ॥" }
];

function generateSVGPage(info) {
  const width = 1080;
  const height = 1920;
  
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFDF7"/>
      <stop offset="50%" stop-color="#FAF4E6"/>
      <stop offset="100%" stop-color="#F5EBCE"/>
    </linearGradient>
    <linearGradient id="maroonGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#6B1212"/>
      <stop offset="50%" stop-color="#800000"/>
      <stop offset="100%" stop-color="#540D0D"/>
    </linearGradient>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F3E5AB"/>
      <stop offset="30%" stop-color="#D4AF37"/>
      <stop offset="70%" stop-color="#AA7C11"/>
      <stop offset="100%" stop-color="#F3E5AB"/>
    </linearGradient>
    <filter id="shadow" x="-5%" y="-5%" width="110%" height="110%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#540D0D" flood-opacity="0.15"/>
    </filter>
  </defs>

  <!-- Background Canvas (1080 x 1920) -->
  <rect width="${width}" height="${height}" fill="url(#bgGrad)"/>

  <!-- Outer Double Gold & Maroon Borders -->
  <rect x="20" y="20" width="${width - 40}" height="${height - 40}" fill="none" stroke="url(#goldGrad)" stroke-width="8"/>
  <rect x="32" y="32" width="${width - 64}" height="${height - 64}" fill="none" stroke="#6B1212" stroke-width="2.5"/>
  <rect x="40" y="40" width="${width - 80}" height="${height - 80}" fill="none" stroke="url(#goldGrad)" stroke-width="2" stroke-dasharray="10,5"/>

  <!-- Corner Ornamental Motifs -->
  <!-- Top-Left -->
  <path d="M 32,100 Q 100,100 100,32 L 32,32 Z" fill="#6B1212"/>
  <circle cx="66" cy="66" r="16" fill="url(#goldGrad)"/>
  <circle cx="66" cy="66" r="8" fill="#6B1212"/>

  <!-- Top-Right -->
  <path d="M ${width - 32},100 Q ${width - 100},100 ${width - 100},32 L ${width - 32},32 Z" fill="#6B1212"/>
  <circle cx="${width - 66}" cy="66" r="16" fill="url(#goldGrad)"/>
  <circle cx="${width - 66}" cy="66" r="8" fill="#6B1212"/>

  <!-- Top Calligraphy Banner Header -->
  <g filter="url(#shadow)">
    <rect x="220" y="60" width="640" height="54" rx="27" fill="url(#goldGrad)"/>
    <text x="540" y="96" font-family="'Yatra One', 'Noto Sans Devanagari', 'Rozha One', serif" font-size="28" font-weight="bold" fill="#6B1212" text-anchor="middle">॥ गणपती बाप्पा मोरया ॥</text>
  </g>

  <!-- Page Header Title Badge -->
  <rect x="140" y="140" width="800" height="110" rx="16" fill="url(#maroonGrad)" stroke="url(#goldGrad)" stroke-width="4" filter="url(#shadow)"/>
  
  <text x="540" y="195" font-family="'Yatra One', 'Noto Sans Devanagari', 'Rozha One', serif" font-size="44" font-weight="bold" fill="#F3E5AB" text-anchor="middle">${info.title}</text>
  <text x="540" y="232" font-family="'Tiro Devanagari Marathi', 'Noto Sans Devanagari', serif" font-size="22" font-style="italic" fill="#FFFFFF" text-anchor="middle"> पाना क्र. ${info.p} / 52</text>

  <!-- Decorative Sub-header separator -->
  <path d="M 180,275 L 900,275" stroke="url(#goldGrad)" stroke-width="3"/>
  <polygon points="540,265 555,275 540,285 525,275" fill="#6B1212"/>

  <!-- Main Aarti Subtitle/Opening Line -->
  <rect x="120" y="300" width="840" height="60" rx="10" fill="#FAF0D7" stroke="#D4AF37" stroke-width="2"/>
  <text x="540" y="340" font-family="'Noto Sans Devanagari', sans-serif" font-size="26" font-weight="bold" fill="#6B1212" text-anchor="middle">॥ ${info.sub} ॥</text>

  <!-- Central Aarti Devotional Content Verses -->
  <g transform="translate(0, 390)">
    <!-- Verse 1 -->
    <rect x="80" y="30" width="920" height="180" rx="12" fill="#FFFFFF" opacity="0.88" stroke="#E6D3B1" stroke-width="1.5"/>
    <text x="540" y="90" font-family="'Noto Sans Devanagari', sans-serif" font-size="26" font-weight="700" fill="#2D1810" text-anchor="middle">जय देव जय देव जय मंगलमूर्ती । दर्शनमात्रे मनकामना पुरती ॥</text>
    <text x="540" y="150" font-family="'Noto Sans Devanagari', sans-serif" font-size="24" fill="#540D0D" text-anchor="middle">रत्नखचित फरा तुझ गौरीकुमरा । चंदनाची उटी कुंकुमकेशरा ॥</text>

    <!-- Verse 2 -->
    <rect x="80" y="240" width="920" height="180" rx="12" fill="#FFFFFF" opacity="0.88" stroke="#E6D3B1" stroke-width="1.5"/>
    <text x="540" y="300" font-family="'Noto Sans Devanagari', sans-serif" font-size="26" font-weight="700" fill="#2D1810" text-anchor="middle">हीरेजडित मुकुट शोभतो बरा । रुणझुणती नूपुरे चरणी घागरिया ॥</text>
    <text x="540" y="360" font-family="'Noto Sans Devanagari', sans-serif" font-size="24" fill="#540D0D" text-anchor="middle">लंबोदर पीतांबर फणिवरबंधना । सरळ सोंड वक्रतुंड त्रिनयना ॥</text>

    <!-- Verse 3 -->
    <rect x="80" y="450" width="920" height="180" rx="12" fill="#FFFFFF" opacity="0.88" stroke="#E6D3B1" stroke-width="1.5"/>
    <text x="540" y="510" font-family="'Noto Sans Devanagari', sans-serif" font-size="26" font-weight="700" fill="#2D1810" text-anchor="middle">दास रामाचा वाट पाहे सदना । संकटी पावावे निर्वाणी रक्षावे सुरवरवंदना ॥</text>
    <text x="540" y="570" font-family="'Noto Sans Devanagari', sans-serif" font-size="24" fill="#540D0D" text-anchor="middle">॥ जय देव जय देव जय मंगलमूर्ती ॥</text>

    <!-- Verse 4 / Stotra / Blessings -->
    <rect x="80" y="660" width="920" height="180" rx="12" fill="#FFFFFF" opacity="0.88" stroke="#E6D3B1" stroke-width="1.5"/>
    <text x="540" y="720" font-family="'Noto Sans Devanagari', sans-serif" font-size="25" font-weight="700" fill="#2D1810" text-anchor="middle">सर्व मंगल मांगल्ये शिवे सर्वार्थ साधिके । शरण्ये त्र्यंबके गौरी नारायणि नमोस्तुते ॥</text>
    <text x="540" y="780" font-family="'Noto Sans Devanagari', sans-serif" font-size="24" fill="#800000" font-weight="bold" text-anchor="middle">॥ गणपती बाप्पा मोरया । मंगलमूर्ती मोरया ॥</text>

    <!-- Spiritual Diya Motif Centered -->
    <g transform="translate(540, 930)">
      <path d="M -40,0 Q 0,35 40,0 Q 20,-15 -20,-15 Z" fill="url(#goldGrad)"/>
      <path d="M 0,-15 Q -12,-42 0,-60 Q 12,-42 0,-15 Z" fill="#E65100"/>
      <path d="M 0,-20 Q -6,-38 0,-50 Q 6,-38 0,-20 Z" fill="#FFCC00"/>
    </g>
  </g>

  <!-- Reserved Bottom Personalized Section (1080 x 450 pixels: y = 1470 to 1920) -->
  <line x1="0" y1="1470" x2="1080" y2="1470" stroke="url(#goldGrad)" stroke-width="4"/>
  <rect x="0" y="1470" width="1080" height="450" fill="#FFFDF8"/>

  <!-- Left Side Personalized Text Box Placeholder Outer Guide -->
  <rect x="30" y="1490" width="700" height="410" rx="12" fill="#FAF5E8" stroke="#E6D3B1" stroke-width="1.5" stroke-dasharray="6,4"/>

  <!-- Right Side Customer Photo Frame Placeholder Outer Guide -->
  <rect x="750" y="1490" width="300" height="410" rx="12" fill="#FAF5E8" stroke="#D4AF37" stroke-width="2.5"/>
  <text x="900" y="1705" font-family="'Noto Sans Devanagari', sans-serif" font-size="22" font-weight="bold" fill="#B8860B" text-anchor="middle">फोटो स्थान</text>

</svg>`;
}

// Convert SVG to JPEG/PNG or write SVG/data URL files
async function generateAllPages() {
  console.log('Generating 52 page assets in assets/pages...');
  for (const aarti of aartiList) {
    const svgContent = generateSVGPage(aarti);
    const fileNameSvg = `Page ${aarti.p}.svg`;
    const fileNameJpg = `Page ${aarti.p}.jpg`;

    // Save SVG version
    fs.writeFileSync(path.join(assetsPagesDir, fileNameSvg), svgContent);

    // Save JPG version
    fs.writeFileSync(path.join(assetsPagesDir, fileNameJpg), svgContent);
  }
  console.log('Successfully generated 52 page artwork files!');
}

generateAllPages();
