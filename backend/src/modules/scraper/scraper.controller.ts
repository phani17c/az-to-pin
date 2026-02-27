import { Controller, Post, Body } from '@nestjs/common';
import { ScraperService } from './scraper.service';
import { IsUrl, IsString } from 'class-validator';

class ScrapeDto {
  @IsString()
  url: string;
}

@Controller('scraper')
export class ScraperController {
  constructor(private readonly scraperService: ScraperService) {}

  @Post('extract')
  async extract(@Body() dto: ScrapeDto) {
    const product = await this.scraperService.scrape(dto.url);
    return { success: true, data: product };
  }
}
