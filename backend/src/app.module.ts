import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScraperModule } from './modules/scraper/scraper.module';
import { AiModule } from './modules/ai/ai.module';
import { PinterestModule } from './modules/pinterest/pinterest.module';
import { AffiliateModule } from './modules/affiliate/affiliate.module';
import { PinDesignerModule } from './modules/pin-designer/pin-designer.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 30 }]),
    ScraperModule,
    AiModule,
    PinterestModule,
    AffiliateModule,
    PinDesignerModule,
  ],
})
export class AppModule {}
