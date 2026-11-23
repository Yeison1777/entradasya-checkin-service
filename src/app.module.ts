import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';

import { CheckinsService } from './application/checkins.service';
import { EVENT_ACCESS_GATEWAY } from './application/ports/event-access.gateway';
import { TICKET_VALIDATION_GATEWAY } from './application/ports/ticket-validation.gateway';
import { CHECKINS_REPOSITORY } from './domain/checkins.repository';
import { validateEnvironment } from './infrastructure/config/environment';
import { PrismaCheckinsRepository } from './infrastructure/database/prisma-checkins.repository';
import { PrismaService } from './infrastructure/database/prisma.service';
import { HttpEventAccessGateway } from './infrastructure/http/http-event-access.gateway';
import { HttpTicketValidationGateway } from './infrastructure/http/http-ticket-validation.gateway';
import { JwtStrategy } from './presentation/http/auth/jwt.strategy';
import {
  DoorStaffGuard,
  EventReportGuard,
} from './presentation/http/auth/role.guard';
import { CheckinsController } from './presentation/http/checkins.controller';
import { HealthController } from './presentation/http/health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnvironment }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [CheckinsController, HealthController],
  providers: [
    CheckinsService,
    PrismaService,
    PrismaCheckinsRepository,
    HttpTicketValidationGateway,
    HttpEventAccessGateway,
    JwtStrategy,
    DoorStaffGuard,
    EventReportGuard,
    { provide: CHECKINS_REPOSITORY, useExisting: PrismaCheckinsRepository },
    {
      provide: TICKET_VALIDATION_GATEWAY,
      useExisting: HttpTicketValidationGateway,
    },
    { provide: EVENT_ACCESS_GATEWAY, useExisting: HttpEventAccessGateway },
  ],
})
export class AppModule {}
