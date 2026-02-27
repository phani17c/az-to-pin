import { Module, Controller, Injectable, Get, Post, Body, Param, Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AffiliateLink {
  id: string;
  asin: string;
  tag: string;
  originalUrl: string;
  trackingUrl: string;
  shortCode: string;
  clicks: number;
  conversions: number;
  revenue: number;
  createdAt: Date;
  lastClickAt?: Date;
}

export interface ClickEvent {
  linkId: string;
  ip: string;
  userAgent: string;
  referrer: string;
  timestamp: Date;
  converted: boolean;
  orderValue?: number;
}

// In-memory store (replace with DB in production)
const affiliateLinks: AffiliateLink[] = [];
const clickEvents: ClickEvent[] = [];

// ─── Service ──────────────────────────────────────────────────────────────────

@Injectable()
export class AffiliateService {
  private readonly logger = new Logger(AffiliateService.name);

  generateLink(asin: string, tag: string, baseUrl?: string): AffiliateLink {
    const shortCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const trackingUrl = `https://www.amazon.com/dp/${asin}?tag=${tag}&linkCode=ll1&linkId=${shortCode}`;

    const link: AffiliateLink = {
      id: uuidv4(),
      asin,
      tag,
      originalUrl: baseUrl || `https://www.amazon.com/dp/${asin}`,
      trackingUrl,
      shortCode,
      clicks: 0,
      conversions: 0,
      revenue: 0,
      createdAt: new Date(),
    };

    affiliateLinks.push(link);
    this.logger.log(`Generated affiliate link for ASIN: ${asin}, tag: ${tag}`);
    return link;
  }

  recordClick(linkId: string, ip = 'unknown', userAgent = '', referrer = ''): void {
    const link = affiliateLinks.find(l => l.id === linkId);
    if (link) {
      link.clicks++;
      link.lastClickAt = new Date();
      clickEvents.push({ linkId, ip, userAgent, referrer, timestamp: new Date(), converted: false });
    }
  }

  recordConversion(linkId: string, orderValue: number): void {
    const link = affiliateLinks.find(l => l.id === linkId);
    if (link) {
      link.conversions++;
      // Amazon Associates typical commission ~4%
      link.revenue += orderValue * 0.04;
      const click = clickEvents.filter(c => c.linkId === linkId).pop();
      if (click) { click.converted = true; click.orderValue = orderValue; }
    }
  }

  getStats(): {
    totalClicks: number;
    totalConversions: number;
    totalRevenue: number;
    conversionRate: number;
    topLinks: AffiliateLink[];
  } {
    const totalClicks = affiliateLinks.reduce((s, l) => s + l.clicks, 0);
    const totalConversions = affiliateLinks.reduce((s, l) => s + l.conversions, 0);
    const totalRevenue = affiliateLinks.reduce((s, l) => s + l.revenue, 0);
    return {
      totalClicks,
      totalConversions,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      conversionRate: totalClicks > 0 ? Math.round((totalConversions / totalClicks) * 10000) / 100 : 0,
      topLinks: [...affiliateLinks].sort((a, b) => b.clicks - a.clicks).slice(0, 10),
    };
  }

  getAllLinks(): AffiliateLink[] {
    return affiliateLinks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
}

// ─── Controller ───────────────────────────────────────────────────────────────

class GenerateLinkDto {
  asin: string;
  tag: string;
  baseUrl?: string;
}

class RecordClickDto {
  linkId: string;
}

@Controller('affiliate')
export class AffiliateController {
  constructor(private readonly affiliateService: AffiliateService) {}

  @Post('generate')
  generate(@Body() dto: GenerateLinkDto) {
    const link = this.affiliateService.generateLink(dto.asin, dto.tag, dto.baseUrl);
    return { success: true, data: link };
  }

  @Post('click')
  click(@Body() dto: RecordClickDto) {
    this.affiliateService.recordClick(dto.linkId);
    return { success: true };
  }

  @Get('stats')
  stats() {
    return { success: true, data: this.affiliateService.getStats() };
  }

  @Get('links')
  links() {
    return { success: true, data: this.affiliateService.getAllLinks() };
  }
}

// ─── Module ───────────────────────────────────────────────────────────────────

@Module({
  controllers: [AffiliateController],
  providers: [AffiliateService],
  exports: [AffiliateService],
})
export class AffiliateModule {}
