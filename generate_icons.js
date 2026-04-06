const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

function drawIcon(size, maskable = false) {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');
    const r = size;
    const cx = r / 2;
    const cy = r / 2;

    // Clear — transparent background
    ctx.clearRect(0, 0, r, r);

    // For maskable icons: fill safe zone background
    if (maskable) {
        ctx.fillStyle = '#081610';
        ctx.fillRect(0, 0, r, r);
    }

    // === CIRCLE BASE — dark green felt with gold ring ===
    const circleR = r * 0.46;

    // Outer glow
    ctx.shadowColor = 'rgba(201, 168, 50, 0.3)';
    ctx.shadowBlur = size * 0.04;
    ctx.beginPath();
    ctx.arc(cx, cy, circleR, 0, Math.PI * 2);
    const bgGrad = ctx.createRadialGradient(cx, cy * 0.85, 0, cx, cy, circleR);
    bgGrad.addColorStop(0, '#1A4D30');
    bgGrad.addColorStop(0.7, '#0F261A');
    bgGrad.addColorStop(1, '#0A1A10');
    ctx.fillStyle = bgGrad;
    ctx.fill();
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;

    // Gold ring
    ctx.strokeStyle = '#C9A832';
    ctx.lineWidth = Math.max(1.5, size * 0.025);
    ctx.stroke();

    // Inner thin ring
    ctx.strokeStyle = 'rgba(201, 168, 50, 0.15)';
    ctx.lineWidth = Math.max(0.5, size * 0.006);
    ctx.beginPath();
    ctx.arc(cx, cy, circleR * 0.85, 0, Math.PI * 2);
    ctx.stroke();

    // === PLAYING CARDS — 3 cards fanned out ===
    const cardW = r * 0.22;
    const cardH = cardW * 1.45;
    const cardR = Math.max(2, size * 0.015); // corner radius

    function drawCard(x, y, angle, isFront, symbol, color) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);

        // Card shadow
        ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
        ctx.shadowBlur = size * 0.025;
        ctx.shadowOffsetY = size * 0.01;

        // Card body
        const hw = cardW / 2;
        const hh = cardH / 2;

        ctx.beginPath();
        ctx.roundRect(-hw, -hh, cardW, cardH, cardR);

        if (isFront) {
            // White card face
            const faceGrad = ctx.createLinearGradient(-hw, -hh, hw, hh);
            faceGrad.addColorStop(0, '#FFFFFF');
            faceGrad.addColorStop(1, '#F0EDE5');
            ctx.fillStyle = faceGrad;
        } else {
            // Green card back with gold pattern
            const backGrad = ctx.createLinearGradient(-hw, -hh, hw, hh);
            backGrad.addColorStop(0, '#1B6B3A');
            backGrad.addColorStop(1, '#0D3A1F');
            ctx.fillStyle = backGrad;
        }
        ctx.fill();
        ctx.shadowColor = 'transparent';

        // Card border
        ctx.strokeStyle = isFront ? 'rgba(201, 168, 50, 0.5)' : 'rgba(201, 168, 50, 0.6)';
        ctx.lineWidth = Math.max(0.5, size * 0.005);
        ctx.stroke();

        if (isFront) {
            // Front card: Gold "W" with suit symbols
            const fontSize = cardW * 0.65;
            ctx.font = `900 ${fontSize}px Arial Black, Impact, sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            const tGrad = ctx.createLinearGradient(-hw * 0.5, -hh * 0.3, hw * 0.5, hh * 0.3);
            tGrad.addColorStop(0, '#FFD700');
            tGrad.addColorStop(0.5, '#E2C547');
            tGrad.addColorStop(1, '#C9A832');
            ctx.fillStyle = tGrad;
            ctx.fillText('W', 0, fontSize * 0.03);

            // Small suit in corners
            if (size >= 96) {
                const ss = cardW * 0.16;
                ctx.font = `${ss}px serif`;
                ctx.fillStyle = '#C9A832';
                ctx.globalAlpha = 0.5;
                ctx.fillText('♠', -hw + ss * 0.8, -hh + ss * 1.3);
                ctx.fillText('♠', hw - ss * 0.8, hh - ss * 0.4);
                ctx.globalAlpha = 1;
            }
        } else {
            // Back card: decorative gold pattern
            ctx.strokeStyle = 'rgba(201, 168, 50, 0.3)';
            ctx.lineWidth = Math.max(0.3, size * 0.003);
            const inset = cardW * 0.12;
            ctx.beginPath();
            ctx.roundRect(-hw + inset, -hh + inset, cardW - inset * 2, cardH - inset * 2, cardR);
            ctx.stroke();

            // Center diamond
            if (size >= 72) {
                const ds = cardW * 0.15;
                ctx.fillStyle = 'rgba(201, 168, 50, 0.25)';
                ctx.beginPath();
                ctx.moveTo(0, -ds);
                ctx.lineTo(ds, 0);
                ctx.lineTo(0, ds);
                ctx.lineTo(-ds, 0);
                ctx.closePath();
                ctx.fill();
            }
        }

        ctx.restore();
    }

    // Card positions — fanned from center
    const cardCY = cy + r * 0.02;

    // Back card left (tilted left)
    drawCard(cx - r * 0.1, cardCY, -0.3, false);

    // Back card right (tilted right)
    drawCard(cx + r * 0.1, cardCY, 0.3, false);

    // Front card center (straight)
    drawCard(cx, cardCY - r * 0.01, 0, true);

    // === CROWN above cards ===
    if (size >= 64) {
        const crownY = cy - r * 0.26;
        const crownW = r * 0.18;
        const crownH = r * 0.09;

        ctx.save();
        ctx.translate(cx, crownY);

        // Crown shadow
        ctx.shadowColor = 'rgba(201, 168, 50, 0.4)';
        ctx.shadowBlur = size * 0.02;

        // Crown shape
        ctx.beginPath();
        ctx.moveTo(-crownW, crownH * 0.4);
        ctx.lineTo(-crownW * 0.6, -crownH * 0.6);
        ctx.lineTo(-crownW * 0.2, crownH * 0.1);
        ctx.lineTo(0, -crownH);
        ctx.lineTo(crownW * 0.2, crownH * 0.1);
        ctx.lineTo(crownW * 0.6, -crownH * 0.6);
        ctx.lineTo(crownW, crownH * 0.4);
        ctx.closePath();

        const crGrad = ctx.createLinearGradient(-crownW, -crownH, crownW, crownH * 0.4);
        crGrad.addColorStop(0, '#FFD700');
        crGrad.addColorStop(0.5, '#E2C547');
        crGrad.addColorStop(1, '#C9A832');
        ctx.fillStyle = crGrad;
        ctx.fill();

        ctx.strokeStyle = 'rgba(160, 130, 20, 0.6)';
        ctx.lineWidth = Math.max(0.5, size * 0.004);
        ctx.stroke();

        ctx.shadowColor = 'transparent';

        // Crown jewels (small circles)
        if (size >= 128) {
            const jewels = [-crownW * 0.6, 0, crownW * 0.6];
            jewels.forEach(jx => {
                ctx.beginPath();
                ctx.arc(jx, -crownH * 0.3, size * 0.008, 0, Math.PI * 2);
                ctx.fillStyle = '#FF6347';
                ctx.fill();
            });
        }

        ctx.restore();
    }

    // === Bottom suit symbols ===
    if (size >= 96) {
        const bottomY = cy + r * 0.37;
        const suitS = size * 0.04;
        ctx.font = `${suitS}px serif`;
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(201, 168, 50, 0.3)';
        ctx.fillText('♥', cx - suitS * 1.5, bottomY);
        ctx.fillText('♦', cx - suitS * 0.3, bottomY);
        ctx.fillText('♣', cx + suitS * 0.9, bottomY);
        ctx.fillText('♠', cx + suitS * 2.1, bottomY);
    }

    return canvas;
}

// Generate all sizes
const iconsDir = path.join(__dirname, 'icons');

const standardIcons = {
    'icon-72x72.png': 72,
    'icon-96x96.png': 96,
    'icon-128x128.png': 128,
    'icon-144x144.png': 144,
    'icon-152x152.png': 152,
    'icon-192x192.png': 192,
    'icon-384x384.png': 384,
    'icon-512x512.png': 512,
};

const appleIcons = {
    'apple-touch-icon-120x120.png': 120,
    'apple-touch-icon-152x152.png': 152,
    'apple-touch-icon-167x167.png': 167,
    'apple-touch-icon-180x180.png': 180,
};

const favicons = {
    'favicon-16x16.png': 16,
    'favicon-32x32.png': 32,
};

console.log('Generating professional card game icons...\n');

let count = 0;

// Standard icons — transparent background (for "any" purpose)
for (const [filename, size] of Object.entries(standardIcons)) {
    const canvas = drawIcon(size, false);
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(path.join(iconsDir, filename), buffer);
    console.log(`  ✓ ${filename} (${size}px, ${(buffer.length / 1024).toFixed(1)}KB) — transparent`);
    count++;
}

// Apple icons — need solid background (iOS requires it)
for (const [filename, size] of Object.entries(appleIcons)) {
    const canvas = drawIcon(size, true);
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(path.join(iconsDir, filename), buffer);
    console.log(`  ✓ ${filename} (${size}px, ${(buffer.length / 1024).toFixed(1)}KB) — solid bg`);
    count++;
}

// Favicons — transparent
for (const [filename, size] of Object.entries(favicons)) {
    const canvas = drawIcon(size, false);
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(path.join(iconsDir, filename), buffer);
    console.log(`  ✓ ${filename} (${size}px, ${(buffer.length / 1024).toFixed(1)}KB) — favicon`);
    count++;
}

// Maskable icons for PWA (solid background, for manifest "maskable" purpose)
const maskableSizes = {
    'apple-touch-icon-192x192.png': 192,
    'apple-touch-icon-512x512.png': 512,
};

for (const [filename, size] of Object.entries(maskableSizes)) {
    const canvas = drawIcon(size, true);
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(path.join(iconsDir, filename), buffer);
    console.log(`  ✓ ${filename} (${size}px, ${(buffer.length / 1024).toFixed(1)}KB) — maskable`);
    count++;
}

console.log(`\nDone! Generated ${count} icons with fanned cards + crown design.`);
