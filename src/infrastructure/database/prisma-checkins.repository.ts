import { Injectable } from '@nestjs/common';

import { Checkin } from '../../domain/checkin';
import {
  CheckinsRepository,
  RegisterCheckinData,
  RegisterCheckinResult,
} from '../../domain/checkins.repository';
import { Prisma } from '../../generated/prisma/client';
import { PrismaService } from './prisma.service';

@Injectable()
export class PrismaCheckinsRepository implements CheckinsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async register(data: RegisterCheckinData): Promise<RegisterCheckinResult> {
    try {
      const checkin = await this.prisma.checkin.create({ data });
      return { created: true, checkin };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        const existing = await this.prisma.checkin.findUnique({
          where: { ticketId: data.ticketId },
        });
        if (existing) return { created: false, checkin: existing };
      }
      throw error;
    }
  }

  countByEvent(eventId: string): Promise<number> {
    return this.prisma.checkin.count({ where: { eventId } });
  }

  recentByEvent(eventId: string, limit: number): Promise<Checkin[]> {
    return this.prisma.checkin.findMany({
      where: { eventId },
      orderBy: { checkedInAt: 'desc' },
      take: limit,
    });
  }
}
