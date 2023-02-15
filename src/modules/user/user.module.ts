import { forwardRef, Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { UserService } from './user.service';
import User from './entities';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileModule } from '../file/file.module';

@Module({
  controllers: [],
  providers: [UserService],
  imports: [
    forwardRef(() => AuthModule),
    forwardRef(() => FileModule),
    TypeOrmModule.forFeature([User]),
  ],
  exports: [UserService],
})
export class UserModule {}
