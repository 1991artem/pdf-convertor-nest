import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class LoginUserhDto {
  @ApiProperty({ example: 'admin', description: 'Login' })
  @IsString({ message: 'Login must be a string' })
  @Length(5, 256, { message: 'Invalid Login. Length - Min: 5, Max: 256' })
  readonly login: string;

  @ApiProperty({ example: 'admin', description: 'Password' })
  @IsString({ message: 'Password must be a string' })
  @Length(5, 256, { message: 'Invalid Login. Length - Min: 5, Max: 256' })
  readonly password: string;
}
