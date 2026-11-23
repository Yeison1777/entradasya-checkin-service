import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';

import { CheckinsService } from '../../application/checkins.service';
import type { AuthUser } from './auth/auth-user';
import { CurrentUser } from './auth/current-user.decorator';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { DoorStaffGuard, EventReportGuard } from './auth/role.guard';
import { RegisterCheckinDto } from './dto/register-checkin.dto';

@Controller('checkins')
@UseGuards(JwtAuthGuard)
export class CheckinsController {
  constructor(private readonly checkins: CheckinsService) {}

  @Post()
  @UseGuards(DoorStaffGuard)
  register(@Body() input: RegisterCheckinDto, @CurrentUser() user: AuthUser) {
    return this.checkins.register(input.eventId, input.code, user.sub);
  }

  @Get('events/:eventId/summary')
  @UseGuards(EventReportGuard)
  summary(
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.checkins.summary(eventId, user);
  }

  @Get('events/:eventId/recent')
  @UseGuards(EventReportGuard)
  recent(
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.checkins.recent(eventId, user);
  }
}
