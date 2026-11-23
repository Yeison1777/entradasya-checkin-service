import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import {
  EventAccessDeniedError,
  EventValidationUnavailableError,
} from '../../application/errors/checkin.errors';
import { EventAccessGateway } from '../../application/ports/event-access.gateway';

@Injectable()
export class HttpEventAccessGateway implements EventAccessGateway {
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly timeout: number;

  constructor(config: ConfigService) {
    this.baseUrl = config.getOrThrow<string>('EVENTS_SERVICE_URL');
    this.apiKey = config.getOrThrow<string>('INTERNAL_API_KEY');
    this.timeout = config.get<number>('HTTP_TIMEOUT_MS', 3000);
  }

  async verifyOwnership(eventId: string, organizerId: string): Promise<void> {
    let response: Response;
    try {
      response = await fetch(
        `${this.baseUrl}/internal/events/${eventId}/ownership/${organizerId}`,
        {
          headers: { 'x-internal-api-key': this.apiKey },
          signal: AbortSignal.timeout(this.timeout),
        },
      );
    } catch {
      throw new EventValidationUnavailableError();
    }
    if (response.status === 404) throw new EventAccessDeniedError();
    if (!response.ok) throw new EventValidationUnavailableError();
  }
}
