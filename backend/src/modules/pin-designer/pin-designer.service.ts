import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { AmazonProduct } from '../scraper/scraper.service';
import { PinterestContent } from '../ai/ai.service';

export interface PinDesign {
  svgDataUrl: string;
  htmlPreview: string;
  width: number;
  height: number;
  theme: string;
}

@Injectable()
export class PinDesignerService {
  private readonly logger = new Logger(PinDesignerService.name);

  private readonly themes = {
    bold:    { bg: '#1a0a2e', accent: '#e60023', text: '#ffffff', secondary: '#ff6b9d' },
    elegant: { bg: '#f8f4ef', accent: '#2d1b4e', text: '#1a1a1a', secondary: '#8b5cf6' },
    fresh:   { bg: '#0f2027', accent: '#00d2ff', text: '#ffffff', secondary: '#7ec8e3' },
    warm:    { bg: '#2d1b00', accent: '#ff9900', text: '#fff8f0', secondary: '#ffcc44' },
  };

  generatePin(product: AmazonProduct, content: PinterestContent, themeName?: string): PinDesign {
    try {
      if (!product || !content) {
        throw new Error('product and content are required');
      }

      const themeKey = (themeName && this.themes[themeName]) ? themeName : this.pickTheme(product.category || '');
      const theme = this.themes[themeKey] || this.themes.bold;

      const width = 600;
      const height = 900;

      const imageUrl = (product.images && product.images[0])
        ? product.images[0]
        : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600';

      const titleText = content.title || product.title || 'Check this out!';
      const shortTitle = this.wrapText(titleText, 32);
      const cta = content.callToAction || 'Shop Now →';
      const hashtags = Array.isArray(content.hashtags) ? content.hashtags : [];
      const rating = parseFloat(product.rating) || 0;
      const reviewDisplay = this.shortReviewCount(product.reviewCount || '');
      const price = product.price || '';

      const svg = this.buildSVG({
        theme, width, height, imageUrl, shortTitle, cta,
        hashtags, rating, reviewDisplay, price,
      });

      return {
        svgDataUrl: `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`,
        htmlPreview: this.buildHTMLPreview({ content, product, theme, imageUrl, cta, hashtags }),
        width,
        height,
        theme: themeKey,
      };
    } catch (error) {
      this.logger.error(`Pin generation failed: ${error.message}`);
      this.logger.error(error.stack);
      throw new InternalServerErrorException(`Pin design failed: ${error.message}`);
    }
  }

  private buildSVG({ theme, width, height, imageUrl, shortTitle, cta, hashtags, rating, reviewDisplay, price }): string {
    const lineHeight = 42;
    const titleY = height * 0.58;
    const stars = '★'.repeat(Math.min(5, Math.round(rating))) + '☆'.repeat(Math.max(0, 5 - Math.round(rating)));

    const titleLines = shortTitle.map((line, i) => `
  <text x="30" y="${titleY + i * lineHeight}" font-family="Georgia, serif"
    font-size="26" font-weight="700" fill="${theme.text}">${this.escapeXml(line)}</text>`).join('');

    const hashtagLines = hashtags.slice(0, 3).map((tag, i) => `
  <text x="30" y="${titleY + shortTitle.length * lineHeight + 50 + i * 28}"
    font-family="Georgia, serif" font-size="16" fill="${theme.secondary}" opacity="0.85">#${this.escapeXml(tag)}</text>`).join('');

    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="overlay" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${theme.bg}" stop-opacity="0"/>
      <stop offset="45%" stop-color="${theme.bg}" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="${theme.bg}" stop-opacity="0.97"/>
    </linearGradient>
    <linearGradient id="topBar" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${theme.accent}"/>
      <stop offset="100%" stop-color="${theme.secondary}"/>
    </linearGradient>
    <clipPath id="imgClip">
      <rect width="${width}" height="${height}" rx="16"/>
    </clipPath>
  </defs>

  <rect width="${width}" height="${height}" fill="${theme.bg}" rx="16"/>

  <image href="${imageUrl}" x="0" y="0" width="${width}" height="${Math.round(height * 0.65)}"
    preserveAspectRatio="xMidYMid slice" clip-path="url(#imgClip)"/>

  <rect width="${width}" height="${height}" fill="url(#overlay)" rx="16"/>

  <rect x="0" y="0" width="${width}" height="6" fill="url(#topBar)" rx="3"/>

  ${price ? `
  <rect x="${width - 124}" y="18" width="104" height="40" rx="20" fill="${theme.accent}"/>
  <text x="${width - 72}" y="44" font-family="Georgia, serif" font-size="18" font-weight="700"
    fill="white" text-anchor="middle">${this.escapeXml(price)}</text>` : ''}

  ${rating > 0 ? `
  <rect x="18" y="18" width="120" height="34" rx="17" fill="rgba(0,0,0,0.55)"/>
  <text x="30" y="41" font-family="Georgia, serif" font-size="14" fill="#FFD700">${stars.substring(0,5)}</text>
  <text x="78" y="41" font-family="Georgia, serif" font-size="13" fill="white">${rating}${reviewDisplay ? ' · ' + reviewDisplay : ''}</text>` : ''}

  ${titleLines}

  <rect x="30" y="${titleY + shortTitle.length * lineHeight + 10}" width="50" height="3" fill="${theme.accent}" rx="2"/>

  ${hashtagLines}

  <rect x="30" y="${height - 88}" width="${width - 60}" height="50" rx="25" fill="${theme.accent}"/>
  <text x="${width / 2}" y="${height - 57}" font-family="Georgia, serif" font-size="18" font-weight="700"
    fill="white" text-anchor="middle">${this.escapeXml(cta)}</text>

  <text x="${width / 2}" y="${height - 18}" font-family="Georgia, serif" font-size="11"
    fill="${theme.text}" text-anchor="middle" opacity="0.35">via Amazon</text>
</svg>`;
  }

  private buildHTMLPreview({ content, product, theme, imageUrl, cta, hashtags }): string {
    const title = (content.title || product.title || '').substring(0, 80);
    const tags = hashtags.slice(0, 3).map((h: string) => '#' + h).join(' ');
    return `<div style="width:300px;height:450px;border-radius:12px;overflow:hidden;position:relative;font-family:Georgia,serif;background:${theme.bg}">
  <img src="${imageUrl}" style="width:100%;height:60%;object-fit:cover;display:block"/>
  <div style="position:absolute;top:0;left:0;right:0;height:5px;background:linear-gradient(90deg,${theme.accent},${theme.secondary})"></div>
  <div style="position:absolute;top:10px;right:10px;background:${theme.accent};color:white;padding:3px 10px;border-radius:14px;font-size:13px;font-weight:700">${product.price || ''}</div>
  <div style="padding:14px">
    <div style="color:${theme.text};font-size:14px;font-weight:700;line-height:1.4;margin-bottom:6px">${title}</div>
    <div style="color:${theme.secondary};font-size:11px;margin-bottom:10px">${tags}</div>
    <div style="background:${theme.accent};color:white;text-align:center;padding:8px;border-radius:18px;font-size:13px;font-weight:700">${cta}</div>
  </div>
</div>`;
  }

  private pickTheme(category: string): string {
    const cat = (category || '').toLowerCase();
    if (cat.includes('electronics') || cat.includes('tech') || cat.includes('computer')) return 'fresh';
    if (cat.includes('fashion') || cat.includes('clothing') || cat.includes('apparel')) return 'elegant';
    if (cat.includes('home') || cat.includes('kitchen') || cat.includes('garden')) return 'warm';
    return 'bold';
  }

  private wrapText(text: string, maxChars: number): string[] {
    const words = (text || '').split(' ');
    const lines: string[] = [];
    let current = '';
    for (const word of words) {
      const candidate = current ? `${current} ${word}` : word;
      if (candidate.length <= maxChars) {
        current = candidate;
      } else {
        if (current) lines.push(current);
        current = word.length > maxChars ? word.substring(0, maxChars) : word;
      }
      if (lines.length >= 3) break;
    }
    if (current && lines.length < 3) lines.push(current);
    return lines.slice(0, 3);
  }

  private shortReviewCount(count: string): string {
    if (!count) return '';
    // Handle duplicated patterns like "(2,916)(2,916)" — take just first number
    const match = count.match(/[\d,]+/);
    if (!match) return '';
    const num = parseInt(match[0].replace(/,/g, ''), 10);
    if (isNaN(num)) return '';
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return String(num);
  }

  private escapeXml(str: string): string {
    return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
  }
}