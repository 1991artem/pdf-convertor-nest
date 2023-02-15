import { forwardRef, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '../user/user.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { config } from '../../config';

@Module({
  controllers: [AuthController],
  providers: [AuthService],
  imports: [
    forwardRef(() => UserModule),
    JwtModule.register({
      secret: config.APP.JWT_SECRET,
      signOptions: { expiresIn: `${config.APP.TOKEN_LIFETIME}` },
    }),
  ],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
