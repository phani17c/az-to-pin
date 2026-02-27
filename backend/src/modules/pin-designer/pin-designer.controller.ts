import { Controller, Post, Body, Logger, BadRequestException } from '@nestjs/common';
import { PinDesignerService } from './pin-designer.service';

@Controller('pin-designer')
export class PinDesignerController {
  private readonly logger = new Logger(PinDesignerController.name);

  constructor(private readonly pinDesignerService: PinDesignerService) {}

  @Post('design')
  async design(@Body() body: any) {
    this.logger.log(`Body keys received: ${Object.keys(body || {}).join(', ')}`);

    const product = body?.product ?? body;
    const content = body?.content;

    if (!product || !product.title) {
      throw new BadRequestException('Missing product data in request body');
    }
    if (!content || !content.title) {
      throw new BadRequestException('Missing content data in request body');
    }

    const design = this.pinDesignerService.generatePin(product, content, body?.theme);
    return { success: true, data: design };
  }

  @Post('themes')
  async themes() {
    return { success: true, data: ['bold', 'elegant', 'fresh', 'warm'] };
  }
}