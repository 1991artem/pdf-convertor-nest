import { Response } from 'express';
import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { config } from '../../config';
import { LoginUserhDto } from './dto';
import User from '../user/entities';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async loginUser(loginUserhDto: LoginUserhDto, response: Response) {
    try {
      const { login, password } = loginUserhDto;

      const firstUser = await this.userService.getUserByLoginAndPassword(
        login,
        password,
      );

      if (!firstUser || !firstUser.id) {
        throw new UnauthorizedException({
          message: 'Authentification failed. Check your login/password.',
        });
      }

      const token = await this.generateToken(firstUser);

      const expire = this.generateExpires();

      response.cookie('Authorization', token, {
        expires: new Date(expire),
        httpOnly: true,
      });

      const res = {
        authed: true,
        user: {
          email: firstUser.email,
          userName: firstUser.userName,
        },
        token,
      };

      return res;
    } catch (e) {
      throw new HttpException(
        (e as HttpException).message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  logoutUser(response: Response) {
    response.cookie('Authorization', '', {
      expires: new Date(),
      httpOnly: true,
    });
    return '';
  }

  private async generateToken(user: User) {
    const { id, email, role, userName } = user;
    const payload = { id, email, role, userName };
    return this.jwtService.sign(payload);
  }

  generateExpires() {
    const expire = Number(new Date()) + config.APP.COOKIE_LIFETIME_NUMBER;
    return expire;
  }
}
