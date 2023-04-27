import { forwardRef, Module } from '@nestjs/common';
import File from './entities';
import { FileService } from './file.service';
import { FileController } from './file.controller';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '../user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  controllers: [FileController],
  providers: [FileService],
  imports: [
    forwardRef(() => UserModule),
    TypeOrmModule.forFeature([File]),
    JwtModule,
  ],
})
export class FileModule {}
