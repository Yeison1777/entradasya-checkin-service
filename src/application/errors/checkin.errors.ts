export class InvalidTicketCodeError extends Error {
  constructor() {
    super('El código no corresponde a una entrada válida.');
  }
}

export class TicketValidationUnavailableError extends Error {
  constructor() {
    super('tickets-service no está disponible.');
  }
}

export class EventAccessDeniedError extends Error {
  constructor() {
    super('El organizador no tiene acceso a este evento.');
  }
}

export class EventValidationUnavailableError extends Error {
  constructor() {
    super('events-service no está disponible.');
  }
}
