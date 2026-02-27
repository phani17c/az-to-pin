import { Module } from '@nestjs/common';
import { PinDesignerController } from './pin-designer.controller';
import { PinDesignerService } from './pin-designer.service';

@Module({
  controllers: [PinDesignerController],
  providers: [PinDesignerService],
  exports: [PinDesignerService],
})
export class PinDesignerModule {}
