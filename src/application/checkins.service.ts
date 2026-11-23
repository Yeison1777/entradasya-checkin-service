import { Inject, Injectable } from '@nestjs/common';

import { CHECKINS_REPOSITORY } from '../domain/checkins.repository';
import type { CheckinsRepository } from '../domain/checkins.repository';
import {
  InvalidTicketCodeError,
  TicketValidationUnavailableError,
} from './errors/checkin.errors';
import { EVENT_ACCESS_GATEWAY } from './ports/event-access.gateway';
import type { EventAccessGateway } from './ports/event-access.gateway';
import { TICKET_VALIDATION_GATEWAY } from './ports/ticket-validation.gateway';
import type { TicketValidationGateway } from './ports/ticket-validation.gateway';

export interface CheckinUser {
  sub: string;
  role: 'CLIENT' | 'ORGANIZER' | 'DOOR_STAFF';
}

@Injectable()
export class CheckinsService {
  constructor(
    @Inject(CHECKINS_REPOSITORY)
    private readonly checkins: CheckinsRepository,
    @Inject(TICKET_VALIDATION_GATEWAY)
    private readonly tickets: TicketValidationGateway,
    @Inject(EVENT_ACCESS_GATEWAY)
    private readonly events: EventAccessGateway,
  ) {}

  async register(eventId: string, code: string, doorStaffId: string) {
    let ticket;
    try {
      ticket = await this.tickets.validate(code);
    } catch (error) {
      if (error instanceof InvalidTicketCodeError) {
        return { status: 'INVALID_CODE' as const };
      }
      if (error instanceof TicketValidationUnavailableError) {
        return { status: 'VALIDATION_UNAVAILABLE' as const };
      }
      throw error;
    }

    if (!ticket.valid || ticket.status !== 'VALID') {
      return { status: 'INVALID_CODE' as const };
    }
    if (ticket.eventId !== eventId) {
      return { status: 'WRONG_EVENT' as const };
    }

    const result = await this.checkins.register({
      ticketId: ticket.ticketId,
      ticketCode: code,
      eventId,
      doorStaffId,
    });
    if (!result.created) {
      return {
        status: 'ALREADY_USED' as const,
        checkedInAt: result.checkin.checkedInAt,
      };
    }
    return {
      status: 'ADMITTED' as const,
      checkinId: result.checkin.id,
      checkedInAt: result.checkin.checkedInAt,
    };
  }

  async summary(eventId: string, user: CheckinUser) {
    await this.authorizeEvent(eventId, user);
    return { eventId, admitted: await this.checkins.countByEvent(eventId) };
  }

  async recent(eventId: string, user: CheckinUser) {
    await this.authorizeEvent(eventId, user);
    const checkins = await this.checkins.recentByEvent(eventId, 20);
    return checkins.map((checkin) => ({
      id: checkin.id,
      ticketId: checkin.ticketId,
      ticketCodeSuffix: checkin.ticketCode.slice(-6),
      doorStaffId: checkin.doorStaffId,
      checkedInAt: checkin.checkedInAt,
    }));
  }

  private async authorizeEvent(
    eventId: string,
    user: CheckinUser,
  ): Promise<void> {
    if (user.role === 'ORGANIZER') {
      await this.events.verifyOwnership(eventId, user.sub);
    }
  }
}
