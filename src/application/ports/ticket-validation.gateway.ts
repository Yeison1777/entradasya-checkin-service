export const TICKET_VALIDATION_GATEWAY = Symbol('TICKET_VALIDATION_GATEWAY');

export interface TicketValidation {
  valid: boolean;
  ticketId: string;
  eventId: string;
  status: 'VALID' | 'CANCELLED';
}

export interface TicketValidationGateway {
  validate(code: string): Promise<TicketValidation>;
}
