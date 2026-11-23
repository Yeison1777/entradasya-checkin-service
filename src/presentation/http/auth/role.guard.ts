import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import type { Request } from 'express';

import { AuthUser } from './auth-user';

@Injectable()
export class DoorStaffGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    return (request.user as AuthUser | undefined)?.role === 'DOOR_STAFF';
  }
}

@Injectable()
export class EventReportGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const role = (
      context.switchToHttp().getRequest<Request>().user as AuthUser | undefined
    )?.role;
    return role === 'DOOR_STAFF' || role === 'ORGANIZER';
  }
}
