import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsString,
} from 'class-validator';

export enum SORT {
  CREATED = 'createdAt',
  UPDATE = 'updatedAt',
  NAME = 'name',
}

export interface IDictionary {
  [key: string]: string;
}

export class FindByIdBody {
  @ApiProperty({ example: '10', description: 'User key' })
  @IsString()
  readonly userKey: string;

  @ApiProperty({ example: 'false', description: 'Find converted files?' })
  @Type(() => Boolean)
  readonly converted: boolean;

  @ApiProperty({ example: '0', description: 'Offset' })
  @IsOptional()
  @IsNumber()
  readonly offset: string;

  @ApiProperty({ example: '10', description: 'Limit' })
  @IsOptional()
  @IsNumber()
  readonly limit: string;

  @ApiProperty({ example: 'name', description: 'Sort field' })
  @IsOptional()
  @IsString()
  readonly sort: SORT;

  @ApiProperty({ example: 'DESC', description: 'Sort type' })
  @IsOptional()
  @IsString()
  readonly type: 'ASC' | 'DESC';
}

export class UploadBody {
  @ApiProperty({ example: '10', description: 'User key' })
  @IsString()
  readonly userKey: string;

  @ApiProperty({ example: 'File', description: 'File name' })
  @IsString()
  readonly fileName: string;
}

export class UploadBodyFromStorage {
  @ApiProperty({ example: 'file', description: 'File name' })
  @IsNotEmpty()
  @IsString()
  readonly fileName: string;

  @ApiProperty({ example: '10', description: 'User key' })
  @IsString()
  readonly userKey: string;
}

export class UploadPDFParams {
  @ApiProperty({ example: 'file', description: 'File name' })
  @IsNotEmpty()
  @IsString()
  readonly fileName: string;
}

export class UploadPDFQuery {
  @ApiProperty({ example: '10', description: 'User key' })
  @IsString()
  readonly key: string;
}

export class ConvertFileBody {
  @ApiProperty({ example: 'text', description: 'text' })
  @IsString()
  readonly template: string;

  @ApiProperty({ example: '{key: value}', description: '{key: value}' })
  readonly dictionary: IDictionary;

  @ApiProperty({ example: '10', description: 'User key' })
  @IsNumberString()
  readonly userKey: string;
}
