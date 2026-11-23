import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import {
  InvalidTicketCodeError,
  TicketValidationUnavailableError,
} from '../../application/errors/checkin.errors';
import {
  TicketValidation,
  TicketValidationGateway,
} from '../../application/ports/ticket-validation.gateway';

@Injectable()
export class HttpTicketValidationGateway implements TicketValidationGateway {
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly timeout: number;

  constructor(config: ConfigService) {
    this.baseUrl = config.getOrThrow<string>('TICKETS_SERVICE_URL');
    this.apiKey = config.getOrThrow<string>('INTERNAL_API_KEY');
    this.timeout = config.get<number>('HTTP_TIMEOUT_MS', 3000);
  }

  async validate(code: string): Promise<TicketValidation> {
    let response: Response;
    try {
      response = await fetch(`${this.baseUrl}/internal/tickets/validate`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-internal-api-key': this.apiKey,
        },
        body: JSON.stringify({ code }),
        signal: AbortSignal.timeout(this.timeout),
      });
    } catch {
      throw new TicketValidationUnavailableError();
    }
    if (response.status === 404) throw new InvalidTicketCodeError();
    if (!response.ok) throw new TicketValidationUnavailableError();
    try {
      return (await response.json()) as TicketValidation;
    } catch {
      throw new TicketValidationUnavailableError();
    }
  }
}
