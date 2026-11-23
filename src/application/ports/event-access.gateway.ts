export const EVENT_ACCESS_GATEWAY = Symbol('EVENT_ACCESS_GATEWAY');

export interface EventAccessGateway {
  verifyOwnership(eventId: string, organizerId: string): Promise<void>;
}
