import { ApiProperty } from '@nestjs/swagger';
import { IsNumberString } from 'class-validator';

export interface IDictionary {
  [key: string]: string;
}

export interface IConvertBody {
  dictionary: string;
}

export class FindByIdParams {
  @ApiProperty({ example: '10', description: 'User id' })
  @IsNumberString()
  readonly id: string;
}
