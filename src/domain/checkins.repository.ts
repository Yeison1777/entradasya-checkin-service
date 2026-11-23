import { Checkin } from './checkin';

export const CHECKINS_REPOSITORY = Symbol('CHECKINS_REPOSITORY');

export interface RegisterCheckinData {
  ticketId: string;
  ticketCode: string;
  eventId: string;
  doorStaffId: string;
}

export interface RegisterCheckinResult {
  created: boolean;
  checkin: Checkin;
}

export interface CheckinsRepository {
  register(data: RegisterCheckinData): Promise<RegisterCheckinResult>;
  countByEvent(eventId: string): Promise<number>;
  recentByEvent(eventId: string, limit: number): Promise<Checkin[]>;
}
