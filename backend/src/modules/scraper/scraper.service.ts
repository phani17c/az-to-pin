import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';

export interface AmazonProduct {
  asin: string;
  title: string;
  price: string;
  rating: string;
  reviewCount: string;
  images: string[];
  badge: string | null;
  description: string;
  features: string[];
  category: string;
  url: string;
}

@Injectable()
export class ScraperService {
  private readonly logger = new Logger(ScraperService.name);

  // Rotating user agents to avoid blocks
  private readonly userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  ];

  extractAsin(url: string): string {
    const patterns = [
      /\/dp\/([A-Z0-9]{10})/,
      /\/gp\/product\/([A-Z0-9]{10})/,
      /\/product\/([A-Z0-9]{10})/,
      /asin=([A-Z0-9]{10})/,
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    throw new BadRequestException('Could not extract ASIN from URL. Please use a valid Amazon product URL.');
  }

  async scrape(url: string): Promise<AmazonProduct> {
    const asin = this.extractAsin(url);
    const cleanUrl = `https://www.amazon.com/dp/${asin}`;

    this.logger.log(`Scraping ASIN: ${asin}`);

    const userAgent = this.userAgents[Math.floor(Math.random() * this.userAgents.length)];

    try {
      const response = await axios.get(cleanUrl, {
        headers: {
          'User-Agent': userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
          'Cache-Control': 'max-age=0',
        },
        timeout: 15000,
      });

      return this.parse(response.data, asin, cleanUrl);
    } catch (error) {
      this.logger.error(`Scrape failed: ${error.message}`);
      // Return mock data for development if scraping blocked
      if (error.response?.status === 503 || error.response?.status === 403) {
        this.logger.warn('Amazon blocked request - returning demo data');
        return this.getMockProduct(asin, cleanUrl);
      }
      throw new BadRequestException(`Failed to fetch product: ${error.message}`);
    }
  }

  private parse(html: string, asin: string, url: string): AmazonProduct {
    const $ = cheerio.load(html);

    const title =
      $('#productTitle').text().trim() ||
      $('h1.a-size-large').text().trim() ||
      'Product Title Not Found';

    const price =
      $('.a-price .a-offscreen').first().text().trim() ||
      $('#priceblock_ourprice').text().trim() ||
      $('#priceblock_dealprice').text().trim() ||
      $('.a-price-whole').first().text().trim() ||
      'Price unavailable';

    const rating =
      $('#acrPopover .a-size-base.a-color-base').first().text().trim() ||
      $('[data-hook="rating-out-of-text"]').text().trim() ||
      $('.a-icon-alt').first().text().replace(' out of 5 stars', '').trim() ||
      '0';

    const reviewCount =
      $('#acrCustomerReviewText').text().trim() ||
      $('[data-hook="total-review-count"]').text().trim() ||
      '0 reviews';

    // Extract images
    const images: string[] = [];
    $('img[data-old-hires]').each((_, el) => {
      const src = $(el).attr('data-old-hires');
      if (src && !images.includes(src)) images.push(src);
    });
    $('#imgTagWrapperId img, #landingImage').each((_, el) => {
      const src = $(el).attr('src') || $(el).attr('data-src');
      if (src && src.startsWith('http') && !images.includes(src)) images.push(src);
    });

    // Features / bullet points
    const features: string[] = [];
    $('#feature-bullets li span.a-list-item').each((_, el) => {
      const text = $(el).text().trim();
      if (text && text.length > 5) features.push(text);
    });

    const badge =
      $('#best-seller-rank').length > 0 ? 'Best Seller' :
      $('#saleFlag').length > 0 ? 'On Sale' : null;

    const description =
      $('#productDescription p').text().trim() ||
      $('[data-hook="product-description"]').text().trim() ||
      features.slice(0, 2).join('. ');

    const category =
      $('#wayfinding-breadcrumbs_feature_div a').last().text().trim() ||
      'General';

    return {
      asin,
      title,
      price,
      rating: rating.split(' ')[0],
      reviewCount,
      images: images.length > 0 ? images : [`https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600`],
      badge,
      description,
      features: features.slice(0, 5),
      category,
      url,
    };
  }

  private getMockProduct(asin: string, url: string): AmazonProduct {
    return {
      asin,
      title: 'Premium Product - Demo Mode (Amazon blocked direct scraping)',
      price: '$49.99',
      rating: '4.5',
      reviewCount: '12,456 ratings',
      images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop'],
      badge: 'Best Seller',
      description: 'This is a premium quality product loved by thousands of customers.',
      features: ['High quality materials', 'Easy to use', 'Great value', 'Fast shipping'],
      category: 'General',
      url,
    };
  }
}
