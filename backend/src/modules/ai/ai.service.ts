import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { AmazonProduct } from '../scraper/scraper.service';

export interface PinterestContent {
  title: string;
  description: string;
  hashtags: string[];
  altText: string;
  pinScore: number;
  seoKeywords: string[];
  callToAction: string;
  bestTimeToPost: string;
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(private configService: ConfigService) {}

  async generatePinterestContent(product: AmazonProduct): Promise<PinterestContent> {
    if (!product || !product.title) {
      throw new InternalServerErrorException('Product data is missing or invalid');
    }

    this.logger.log(`Generating Pinterest content for: ${product.title.substring(0, 50)}...`);

    const prompt = `You are a Pinterest marketing expert and SEO specialist. Generate highly optimized Pinterest content for this Amazon product.

PRODUCT DATA:
- Title: ${product.title}
- Price: ${product.price}
- Rating: ${product.rating}/5 stars
- Reviews: ${product.reviewCount}
- Category: ${product.category}
- Key Features: ${product.features.join(', ')}
- Description: ${product.description?.substring(0, 300)}

Generate Pinterest content optimized for maximum engagement, saves, and clicks. Return ONLY valid JSON (no markdown, no code blocks):

{
  "title": "Pinterest title under 100 chars - punchy, curiosity-driven, includes price or rating",
  "description": "SEO description 150-200 chars - conversational, benefit-focused, ends with CTA",
  "hashtags": ["array", "of", "15", "trending", "hashtags", "without", "the", "hash", "symbol"],
  "altText": "Image alt text for accessibility and SEO, 125 chars max",
  "pinScore": <number 60-100 predicting viral potential>,
  "seoKeywords": ["5", "primary", "seo", "keywords"],
  "callToAction": "Short punchy CTA under 30 chars",
  "bestTimeToPost": "Best day and time to post e.g. Saturday 8PM EST"
}`;

    try {
      const token = this.configService.get('GITHUB_TOKEN');
      if (!token) throw new Error('GITHUB_TOKEN is not set in .env');

      const response = await axios.post(
        'https://models.inference.ai.azure.com/chat/completions',
        {
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are a Pinterest marketing expert. Always respond with valid JSON only, no markdown.',
            },
            { role: 'user', content: prompt },
          ],
          max_tokens: 1024,
          temperature: 0.7,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      const text = response.data.choices[0].message.content || '';
      const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(cleaned);

      return {
        title: parsed.title || product.title.substring(0, 100),
        description: parsed.description || '',
        hashtags: parsed.hashtags || [],
        altText: parsed.altText || product.title.substring(0, 125),
        pinScore: Math.min(100, Math.max(60, parsed.pinScore || 75)),
        seoKeywords: parsed.seoKeywords || [],
        callToAction: parsed.callToAction || 'Shop Now →',
        bestTimeToPost: parsed.bestTimeToPost || 'Saturday 8PM EST',
      };
    } catch (error) {
      this.logger.error(`AI generation failed: ${error.message}`);
      this.logger.error(JSON.stringify(error?.response?.data || {}));

      if (error.response?.status === 401) {
        throw new InternalServerErrorException('Invalid GITHUB_TOKEN — check your .env file');
      }
      if (error.response?.status === 429) {
        throw new InternalServerErrorException('GitHub Models rate limit hit — try again in a moment');
      }
      throw new InternalServerErrorException(`Content generation failed: ${error.message}`);
    }
  }
}