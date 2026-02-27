import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { PinterestService } from './pinterest.service';

class SchedulePinDto {
  accessToken: string;
  boardId: string;
  boardName: string;
  title: string;
  description: string;
  imageUrl: string;
  affiliateUrl: string;
  scheduledAt: string;
}

class GetBoardsDto {
  accessToken: string;
}

@Controller('pinterest')
export class PinterestController {
  constructor(private readonly pinterestService: PinterestService) {}

  @Post('boards')
  async getBoards(@Body() dto: GetBoardsDto) {
    const boards = await this.pinterestService.getBoards(dto.accessToken || 'demo');
    return { success: true, data: boards };
  }

  @Post('schedule')
  async schedule(@Body() dto: SchedulePinDto) {
    const pin = await this.pinterestService.schedulePin({
      ...dto,
      scheduledAt: new Date(dto.scheduledAt),
    });
    return { success: true, data: pin };
  }

  @Get('pins')
  async getPins() {
    const pins = this.pinterestService.getScheduledPins();
    return { success: true, data: pins };
  }

  @Get('pins/:id')
  async getPin(@Param('id') id: string) {
    const pin = this.pinterestService.getPinById(id);
    return { success: true, data: pin };
  }
}
