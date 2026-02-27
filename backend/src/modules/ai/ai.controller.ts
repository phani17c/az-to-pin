import { Controller, Post, Body, BadRequestException, Logger } from '@nestjs/common';
import { AiService } from './ai.service';

@Controller('ai')
export class AiController {
  private readonly logger = new Logger(AiController.name);

  constructor(private readonly aiService: AiService) {}

  @Post('generate')
  async generate(@Body() body: any) {
    this.logger.log(`Received body keys: ${Object.keys(body || {}).join(', ')}`);
console.log('BODY RECEIVED:', JSON.stringify(body));

    // Handle both { product: {...} } and flat product object
    const product = body?.product ?? body;

    if (!product || !product.title) {
      this.logger.error(`Invalid product data: ${JSON.stringify(body)}`);
      throw new BadRequestException(
        'Invalid product data. Expected { product: { title, price, ... } }'
      );
    }

    this.logger.log(`Generating content for: ${product.title.substring(0, 50)}`);
    const content = await this.aiService.generatePinterestContent(product);
    return { success: true, data: content };
  }
}