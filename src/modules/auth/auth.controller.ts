import { Response } from 'express';
import {
  Controller,
  Get,
  Post,
  Body,
  ValidationPipe,
  Res,
} from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginUserhDto } from './dto';

@ApiCookieAuth()
@ApiTags('Auth')
@Controller('api')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Login User' })
  @Post('/login')
  async loginUser(
    @Body(new ValidationPipe()) loginUserhDto: LoginUserhDto,
    @Res() response: Response,
  ) {
    const res = await this.authService.loginUser(loginUserhDto, response);
    response.json(res);
  }

  @ApiOperation({ summary: 'Logout' })
  @Get('/logout')
  logoutUser(@Res() response: Response) {
    const res = this.authService.logoutUser(response);
    response.json(res);
  }
}
