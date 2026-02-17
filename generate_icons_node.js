#!/usr/bin/env node
/**
 * Professional Wizard Game Icon Generator
 * Generates high-quality PWA icons with wizard hat, card, and magical effects
 */

const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

function drawIcon(canvas, size) {
    const ctx = canvas.getContext('2d');
    const s = size;

    // === BACKGROUND: Deep dark gradient ===
    const bgGrad = ctx.createRadialGradient(s*0.5, s*0.3, 0, s*0.5, s*0.5, s*0.7);
    bgGrad.addColorStop(0, '#1a1040');
    bgGrad.addColorStop(0.5, '#0d0b1a');
    bgGrad.addColorStop(1, '#050510');
    ctx.fillStyle = bgGrad;
    ctx.beginPath();
    ctx.arc(s/2, s/2, s/2, 0, Math.PI * 2);
    ctx.fill();

    // === OUTER RING: Gold border ===
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = s * 0.025;
    ctx.beginPath();
    ctx.arc(s/2, s/2, s/2 - s*0.02, 0, Math.PI * 2);
    ctx.stroke();

    // Inner decorative ring
    const ringGrad = ctx.createLinearGradient(0, 0, s, s);
    ringGrad.addColorStop(0, '#fbbf24');
    ringGrad.addColorStop(0.5, '#f59e0b');
    ringGrad.addColorStop(1, '#d97706');
    ctx.strokeStyle = ringGrad;
    ctx.lineWidth = s * 0.008;
    ctx.beginPath();
    ctx.arc(s/2, s/2, s/2 - s*0.055, 0, Math.PI * 2);
    ctx.stroke();

    // === MAGICAL PARTICLES / STARS ===
    ctx.save();
    // Use deterministic positions based on index
    for (let i = 0; i < 25; i++) {
        const angle = (i / 25) * Math.PI * 2 + 0.3;
        const distRatio = [0.22, 0.35, 0.18, 0.40, 0.28, 0.33, 0.19, 0.38, 0.25, 0.42,
                          0.20, 0.36, 0.30, 0.15, 0.41, 0.27, 0.34, 0.21, 0.39, 0.23,
                          0.37, 0.16, 0.43, 0.29, 0.32][i];
        const dist = s * distRatio;
        const px = s/2 + Math.cos(angle) * dist;
        const py = s/2 + Math.sin(angle) * dist;
        const starSizeRatio = [0.006, 0.008, 0.005, 0.010, 0.007, 0.009, 0.006, 0.011, 0.005, 0.008,
                               0.007, 0.010, 0.006, 0.009, 0.005, 0.008, 0.011, 0.006, 0.007, 0.010,
                               0.005, 0.009, 0.008, 0.006, 0.011][i];
        const starSize = s * starSizeRatio;
        const alphas = [0.5, 0.7, 0.4, 0.8, 0.6, 0.5, 0.7, 0.3, 0.6, 0.8,
                       0.4, 0.7, 0.5, 0.6, 0.8, 0.3, 0.7, 0.5, 0.4, 0.6,
                       0.8, 0.5, 0.3, 0.7, 0.6][i];
        const alpha = alphas[i];

        const starGrad = ctx.createRadialGradient(px, py, 0, px, py, starSize * 3);
        starGrad.addColorStop(0, `rgba(251, 191, 36, ${alpha})`);
        starGrad.addColorStop(0.5, `rgba(168, 130, 255, ${alpha * 0.5})`);
        starGrad.addColorStop(1, 'rgba(168, 130, 255, 0)');
        ctx.fillStyle = starGrad;
        ctx.beginPath();
        ctx.arc(px, py, starSize * 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.beginPath();
        ctx.arc(px, py, starSize, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.restore();

    // === WIZARD HAT ===
    const hatCenterX = s * 0.5;
    const hatTopY = s * 0.08;
    const hatBaseY = s * 0.42;
    const hatWidth = s * 0.42;

    // Hat shadow/glow
    ctx.save();
    ctx.shadowColor = 'rgba(139, 92, 246, 0.6)';
    ctx.shadowBlur = s * 0.06;

    // Hat body
    const hatGrad = ctx.createLinearGradient(hatCenterX - hatWidth/2, hatBaseY, hatCenterX, hatTopY);
    hatGrad.addColorStop(0, '#2d1b69');
    hatGrad.addColorStop(0.3, '#4c1d95');
    hatGrad.addColorStop(0.6, '#6d28d9');
    hatGrad.addColorStop(1, '#7c3aed');

    ctx.fillStyle = hatGrad;
    ctx.beginPath();
    ctx.moveTo(hatCenterX, hatTopY);
    ctx.quadraticCurveTo(hatCenterX - hatWidth * 0.15, hatBaseY * 0.5, hatCenterX - hatWidth/2, hatBaseY);
    ctx.lineTo(hatCenterX + hatWidth/2, hatBaseY);
    ctx.quadraticCurveTo(hatCenterX + hatWidth * 0.15, hatBaseY * 0.5, hatCenterX, hatTopY);
    ctx.fill();
    ctx.restore();

    // Star at hat tip
    drawStar(ctx, hatCenterX + s*0.02, hatTopY + s*0.01, 5, s*0.025, s*0.012);
    ctx.fillStyle = '#fbbf24';
    ctx.fill();

    // Star glow
    const tipGlow = ctx.createRadialGradient(hatCenterX + s*0.02, hatTopY + s*0.01, 0, hatCenterX + s*0.02, hatTopY + s*0.01, s*0.05);
    tipGlow.addColorStop(0, 'rgba(251, 191, 36, 0.6)');
    tipGlow.addColorStop(1, 'rgba(251, 191, 36, 0)');
    ctx.fillStyle = tipGlow;
    ctx.beginPath();
    ctx.arc(hatCenterX + s*0.02, hatTopY + s*0.01, s*0.05, 0, Math.PI * 2);
    ctx.fill();

    // Hat band (gold belt)
    const bandY = hatBaseY - s * 0.04;
    const bandGrad = ctx.createLinearGradient(0, bandY, 0, bandY + s * 0.04);
    bandGrad.addColorStop(0, '#fbbf24');
    bandGrad.addColorStop(0.5, '#f59e0b');
    bandGrad.addColorStop(1, '#d97706');
    ctx.fillStyle = bandGrad;
    ctx.beginPath();
    const bandLeft = hatCenterX - hatWidth * 0.38;
    const bandRight = hatCenterX + hatWidth * 0.38;
    ctx.moveTo(bandLeft, bandY + s*0.015);
    ctx.quadraticCurveTo(hatCenterX, bandY - s*0.005, bandRight, bandY + s*0.015);
    ctx.lineTo(bandRight, bandY + s*0.04);
    ctx.quadraticCurveTo(hatCenterX, bandY + s*0.02, bandLeft, bandY + s*0.04);
    ctx.closePath();
    ctx.fill();

    // Buckle
    const buckleX = hatCenterX;
    const buckleY = bandY + s*0.025;
    const buckleW = s * 0.04;
    const buckleH = s * 0.03;
    ctx.strokeStyle = '#fef3c7';
    ctx.lineWidth = s * 0.005;
    ctx.strokeRect(buckleX - buckleW/2, buckleY - buckleH/2, buckleW, buckleH);

    // Hat brim
    const brimGrad = ctx.createLinearGradient(0, hatBaseY, 0, hatBaseY + s*0.035);
    brimGrad.addColorStop(0, '#4c1d95');
    brimGrad.addColorStop(1, '#2d1b69');
    ctx.fillStyle = brimGrad;
    ctx.beginPath();
    ctx.ellipse(hatCenterX, hatBaseY + s*0.01, hatWidth * 0.65, s*0.035, 0, 0, Math.PI * 2);
    ctx.fill();

    // Brim highlight
    ctx.strokeStyle = 'rgba(139, 92, 246, 0.5)';
    ctx.lineWidth = s * 0.004;
    ctx.beginPath();
    ctx.ellipse(hatCenterX, hatBaseY + s*0.005, hatWidth * 0.6, s*0.02, 0, Math.PI, Math.PI * 2);
    ctx.stroke();

    // === PLAYING CARD ===
    const cardW = s * 0.28;
    const cardH = s * 0.38;
    const cardX = s * 0.5 - cardW/2;
    const cardY = s * 0.40;

    // Card shadow
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = s * 0.03;
    ctx.shadowOffsetY = s * 0.01;

    const cardGrad = ctx.createLinearGradient(cardX, cardY, cardX + cardW, cardY + cardH);
    cardGrad.addColorStop(0, '#1e1b4b');
    cardGrad.addColorStop(0.5, '#1e1040');
    cardGrad.addColorStop(1, '#0f0a2a');
    ctx.fillStyle = cardGrad;
    roundRect(ctx, cardX, cardY, cardW, cardH, s*0.02);
    ctx.fill();
    ctx.restore();

    // Card border (gold)
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = s * 0.006;
    roundRect(ctx, cardX, cardY, cardW, cardH, s*0.02);
    ctx.stroke();

    // Inner card border
    const inset = s * 0.015;
    ctx.strokeStyle = 'rgba(217, 119, 6, 0.3)';
    ctx.lineWidth = s * 0.003;
    roundRect(ctx, cardX + inset, cardY + inset, cardW - inset*2, cardH - inset*2, s*0.012);
    ctx.stroke();

    // === "W" ON CARD ===
    ctx.save();
    const fontSize = s * 0.22;
    ctx.font = `900 ${fontSize}px Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const wX = s * 0.5;
    const wY = cardY + cardH * 0.45;

    ctx.shadowColor = 'rgba(139, 92, 246, 0.8)';
    ctx.shadowBlur = s * 0.04;

    const wGrad = ctx.createLinearGradient(wX - s*0.1, wY - s*0.1, wX + s*0.1, wY + s*0.1);
    wGrad.addColorStop(0, '#c4b5fd');
    wGrad.addColorStop(0.3, '#ffffff');
    wGrad.addColorStop(0.7, '#e9d5ff');
    wGrad.addColorStop(1, '#a78bfa');
    ctx.fillStyle = wGrad;
    ctx.fillText('W', wX, wY);

    ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(139, 92, 246, 0.4)';
    ctx.lineWidth = s * 0.003;
    ctx.strokeText('W', wX, wY);
    ctx.restore();

    // === SUIT SYMBOLS ===
    const suitSize = s * 0.035;
    ctx.font = `${suitSize}px Arial`;
    ctx.textAlign = 'center';

    ctx.fillStyle = '#a78bfa';
    ctx.fillText('♠', cardX + s*0.03, cardY + s*0.04);
    ctx.fillStyle = '#f87171';
    ctx.fillText('♥', cardX + cardW - s*0.03, cardY + s*0.04);
    ctx.fillStyle = '#fbbf24';
    ctx.fillText('♦', cardX + s*0.03, cardY + cardH - s*0.02);
    ctx.fillStyle = '#34d399';
    ctx.fillText('♣', cardX + cardW - s*0.03, cardY + cardH - s*0.02);

    // === SPARKLES ===
    drawSparkle(ctx, cardX - s*0.04, cardY + cardH*0.3, s*0.02, '#fbbf24');
    drawSparkle(ctx, cardX + cardW + s*0.04, cardY + cardH*0.5, s*0.015, '#a78bfa');
    drawSparkle(ctx, cardX + cardW*0.8, cardY - s*0.02, s*0.012, '#fbbf24');

    // === "WIZARD" TEXT ===
    ctx.save();
    const titleSize = s * 0.075;
    ctx.font = `900 ${titleSize}px Arial, sans-serif`;
    ctx.textAlign = 'center';

    const titleY = cardY + cardH + s * 0.075;

    ctx.shadowColor = 'rgba(251, 191, 36, 0.6)';
    ctx.shadowBlur = s * 0.03;

    const titleGrad = ctx.createLinearGradient(s*0.25, titleY, s*0.75, titleY);
    titleGrad.addColorStop(0, '#fbbf24');
    titleGrad.addColorStop(0.3, '#fef3c7');
    titleGrad.addColorStop(0.5, '#fbbf24');
    titleGrad.addColorStop(0.7, '#fef3c7');
    titleGrad.addColorStop(1, '#f59e0b');
    ctx.fillStyle = titleGrad;
    ctx.fillText('WIZARD', s/2, titleY);

    ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(180, 120, 0, 0.5)';
    ctx.lineWidth = s * 0.002;
    ctx.strokeText('WIZARD', s/2, titleY);
    ctx.restore();

    // === MAGICAL AURA ===
    const auraGrad = ctx.createRadialGradient(s/2, s*0.35, s*0.05, s/2, s*0.35, s*0.45);
    auraGrad.addColorStop(0, 'rgba(139, 92, 246, 0.08)');
    auraGrad.addColorStop(0.5, 'rgba(139, 92, 246, 0.03)');
    auraGrad.addColorStop(1, 'rgba(139, 92, 246, 0)');
    ctx.fillStyle = auraGrad;
    ctx.beginPath();
    ctx.arc(s/2, s*0.35, s*0.45, 0, Math.PI * 2);
    ctx.fill();
}

function drawStar(ctx, cx, cy, spikes, outerR, innerR) {
    let rot = Math.PI / 2 * 3;
    const step = Math.PI / spikes;
    ctx.beginPath();
    ctx.moveTo(cx, cy - outerR);
    for (let i = 0; i < spikes; i++) {
        ctx.lineTo(cx + Math.cos(rot) * outerR, cy + Math.sin(rot) * outerR);
        rot += step;
        ctx.lineTo(cx + Math.cos(rot) * innerR, cy + Math.sin(rot) * innerR);
        rot += step;
    }
    ctx.lineTo(cx, cy - outerR);
    ctx.closePath();
}

function drawSparkle(ctx, x, y, size, color) {
    ctx.save();
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.8;
    ctx.fillRect(x - size*0.12, y - size, size*0.24, size*2);
    ctx.fillRect(x - size, y - size*0.12, size*2, size*0.24);
    const glow = ctx.createRadialGradient(x, y, 0, x, y, size*1.5);
    glow.addColorStop(0, color);
    glow.addColorStop(1, 'transparent');
    ctx.fillStyle = glow;
    ctx.globalAlpha = 0.4;
    ctx.beginPath();
    ctx.arc(x, y, size*1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}

function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
}

// === MAIN: Generate all icons ===
const iconsDir = path.join(__dirname, 'icons');
if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
}

console.log('🧙‍♂️ Generating Professional Wizard Game Icons...');
console.log('═'.repeat(55));

// Standard PWA sizes
const standardSizes = [512, 384, 192, 144, 152, 128, 96, 72];
console.log('\n📱 Standard PWA Icons:');
standardSizes.forEach(size => {
    const canvas = createCanvas(size, size);
    drawIcon(canvas, size);
    const out = path.join(iconsDir, `icon-${size}x${size}.png`);
    fs.writeFileSync(out, canvas.toBuffer('image/png'));
    console.log(`  ✓ ${out} (${size}x${size})`);
});

// iOS icons
const iosSizes = [180, 167, 152, 120];
console.log('\n🍎 iOS Icons:');
iosSizes.forEach(size => {
    const canvas = createCanvas(size, size);
    drawIcon(canvas, size);
    const out = path.join(iconsDir, `apple-touch-icon-${size}x${size}.png`);
    fs.writeFileSync(out, canvas.toBuffer('image/png'));
    console.log(`  ✓ ${out} (${size}x${size})`);
});

// Favicons
console.log('\n🌐 Favicons:');
[32, 16].forEach(size => {
    const canvas = createCanvas(size, size);
    drawIcon(canvas, size);
    const out = path.join(iconsDir, `favicon-${size}x${size}.png`);
    fs.writeFileSync(out, canvas.toBuffer('image/png'));
    console.log(`  ✓ ${out} (${size}x${size})`);
});

console.log('\n' + '═'.repeat(55));
console.log('✅ All icons generated successfully!');
console.log(`📁 Saved to: ${iconsDir}/`);
