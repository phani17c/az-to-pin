import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

export interface ScheduledPin {
  id: string;
  pinId?: string;
  boardId: string;
  boardName: string;
  title: string;
  description: string;
  imageUrl: string;
  affiliateUrl: string;
  scheduledAt: Date;
  status: 'pending' | 'published' | 'failed';
  createdAt: Date;
}

// In-memory store (replace with DB in production)
const scheduledPins: ScheduledPin[] = [];

@Injectable()
export class PinterestService {
  private readonly logger = new Logger(PinterestService.name);
  private readonly PINTEREST_API = 'https://api.pinterest.com/v5';

  constructor(private configService: ConfigService) {}

  async getBoards(accessToken: string): Promise<{ id: string; name: string }[]> {
    try {
      const response = await axios.get(`${this.PINTEREST_API}/boards`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: { page_size: 25 },
      });
      return response.data.items.map((b: any) => ({ id: b.id, name: b.name }));
    } catch (error) {
      this.logger.warn('Pinterest API error, returning demo boards');
      return [
        { id: 'board_1', name: 'Amazon Finds' },
        { id: 'board_2', name: 'Home Essentials' },
        { id: 'board_3', name: 'Gift Ideas' },
        { id: 'board_4', name: 'Best Sellers' },
        { id: 'board_5', name: 'Budget Buys' },
      ];
    }
  }

  async schedulePin(params: {
    accessToken: string;
    boardId: string;
    boardName: string;
    title: string;
    description: string;
    imageUrl: string;
    affiliateUrl: string;
    scheduledAt: Date;
  }): Promise<ScheduledPin> {
    const { accessToken, boardId, boardName, title, description, imageUrl, affiliateUrl, scheduledAt } = params;

    const pin: ScheduledPin = {
      id: uuidv4(),
      boardId,
      boardName,
      title,
      description,
      imageUrl,
      affiliateUrl,
      scheduledAt,
      status: 'pending',
      createdAt: new Date(),
    };

    // Attempt to actually create pin via Pinterest API
    if (accessToken && accessToken !== 'demo') {
      try {
        const response = await axios.post(
          `${this.PINTEREST_API}/pins`,
          {
            board_id: boardId,
            title: title.substring(0, 100),
            description: description.substring(0, 500),
            link: affiliateUrl,
            media_source: {
              source_type: 'image_url',
              url: imageUrl,
            },
          },
          { headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' } }
        );
        pin.pinId = response.data.id;
        pin.status = 'published';
        this.logger.log(`Pin published: ${pin.pinId}`);
      } catch (error) {
        this.logger.warn(`Pinterest publish failed: ${error.message} - saving as scheduled`);
      }
    } else {
      // Demo mode - simulate scheduling
      pin.pinId = `demo_pin_${Date.now()}`;
      this.logger.log('Demo mode: pin scheduled locally');
    }

    scheduledPins.push(pin);
    return pin;
  }

  getScheduledPins(): ScheduledPin[] {
    return scheduledPins.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getPinById(id: string): ScheduledPin | undefined {
    return scheduledPins.find(p => p.id === id);
  }

  updatePinStatus(id: string, status: ScheduledPin['status']): void {
    const pin = scheduledPins.find(p => p.id === id);
    if (pin) pin.status = status;
  }
}
