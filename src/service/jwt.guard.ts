import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { JwtService } from '@nestjs/jwt';
import { config } from '../config';

@Injectable()
export class JwtGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    try {
      const req = context.switchToHttp().getRequest();
      const token = req.cookies.Authorization;

      if (!token) {
        throw new UnauthorizedException({
          message: 'Unauthorized',
        });
      }

      const user = this.jwtService.verify(token, {
        secret: config.APP.JWT_SECRET,
      });

      req.user = user;
      return true;
    } catch (e) {
      throw new UnauthorizedException({
        authed: false,
        message: (e as UnauthorizedException).message,
      });
    }
  }
}
