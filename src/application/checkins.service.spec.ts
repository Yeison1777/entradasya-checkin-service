import { Checkin } from '../domain/checkin';
import { CheckinsRepository } from '../domain/checkins.repository';
import {
  InvalidTicketCodeError,
  TicketValidationUnavailableError,
} from './errors/checkin.errors';
import { EventAccessGateway } from './ports/event-access.gateway';
import { TicketValidationGateway } from './ports/ticket-validation.gateway';
import { CheckinsService } from './checkins.service';

const ids = {
  event: '50000000-0000-4000-8000-000000000001',
  otherEvent: '50000000-0000-4000-8000-000000000002',
  ticket: '50000000-0000-4000-8000-000000000003',
  staff: '50000000-0000-4000-8000-000000000004',
  organizer: '50000000-0000-4000-8000-000000000005',
  checkin: '50000000-0000-4000-8000-000000000006',
};
const code = 'codigo_seguro_de_prueba_12345678901234567890';

describe('CheckinsService', () => {
  let repository: jest.Mocked<CheckinsRepository>;
  let tickets: jest.Mocked<TicketValidationGateway>;
  let events: jest.Mocked<EventAccessGateway>;
  let service: CheckinsService;
  let checkin: Checkin;

  beforeEach(() => {
    checkin = {
      id: ids.checkin,
      ticketId: ids.ticket,
      ticketCode: code,
      eventId: ids.event,
      doorStaffId: ids.staff,
      checkedInAt: new Date('2030-12-20T19:00:00Z'),
    };
    repository = {
      register: jest.fn().mockResolvedValue({ created: true, checkin }),
      countByEvent: jest.fn().mockResolvedValue(3),
      recentByEvent: jest.fn().mockResolvedValue([checkin]),
    };
    tickets = {
      validate: jest.fn().mockResolvedValue({
        valid: true,
        ticketId: ids.ticket,
        eventId: ids.event,
        status: 'VALID',
      }),
    };
    events = { verifyOwnership: jest.fn().mockResolvedValue(undefined) };
    service = new CheckinsService(repository, tickets, events);
  });

  it('registra el primer ingreso válido', async () => {
    const result = await service.register(ids.event, code, ids.staff);

    expect(result).toEqual({
      status: 'ADMITTED',
      checkinId: ids.checkin,
      checkedInAt: checkin.checkedInAt,
    });
  });

  it('rechaza un código inexistente', async () => {
    tickets.validate.mockRejectedValue(new InvalidTicketCodeError());
    await expect(service.register(ids.event, code, ids.staff)).resolves.toEqual(
      {
        status: 'INVALID_CODE',
      },
    );
    expect(repository.register).not.toHaveBeenCalled();
  });

  it('rechaza una entrada correspondiente a otro evento', async () => {
    const result = await service.register(ids.otherEvent, code, ids.staff);
    expect(result).toEqual({ status: 'WRONG_EVENT' });
    expect(repository.register).not.toHaveBeenCalled();
  });

  it('devuelve la hora original ante un segundo escaneo', async () => {
    repository.register.mockResolvedValue({ created: false, checkin });
    const result = await service.register(ids.event, code, ids.staff);
    expect(result).toEqual({
      status: 'ALREADY_USED',
      checkedInAt: checkin.checkedInAt,
    });
  });

  it('informa cuando tickets-service no está disponible', async () => {
    tickets.validate.mockRejectedValue(new TicketValidationUnavailableError());
    await expect(service.register(ids.event, code, ids.staff)).resolves.toEqual(
      {
        status: 'VALIDATION_UNAVAILABLE',
      },
    );
  });

  it('verifica propiedad antes de mostrar el resumen a un organizador', async () => {
    const result = await service.summary(ids.event, {
      sub: ids.organizer,
      role: 'ORGANIZER',
    });
    expect(events.verifyOwnership).toHaveBeenCalledWith(
      ids.event,
      ids.organizer,
    );
    expect(result).toEqual({ eventId: ids.event, admitted: 3 });
  });

  it('no devuelve el código completo en los ingresos recientes', async () => {
    const [result] = await service.recent(ids.event, {
      sub: ids.staff,
      role: 'DOOR_STAFF',
    });
    expect(result.ticketCodeSuffix).toBe(code.slice(-6));
    expect(result).not.toHaveProperty('ticketCode');
    expect(events.verifyOwnership).not.toHaveBeenCalled();
  });
});
