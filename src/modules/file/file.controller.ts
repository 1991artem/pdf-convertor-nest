import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseFilePipeBuilder,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from '../../service';
import { FileService } from './file.service';
import { FindByIdParams, IConvertBody } from './dto';

@ApiTags('File')
@Controller('api/file')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @UseGuards(JwtGuard)
  @ApiOperation({ summary: 'Upload txt file' })
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(
    @UploadedFile(new ParseFilePipeBuilder().build())
    file: Express.Multer.File,
    @Req() request: Request,
    @Body() body: IConvertBody,
  ) {
    const dictionary = JSON.parse(body.dictionary);
    const user = request.user;
    if (!user) {
      throw new BadRequestException({
        message: 'Invalid Cookie',
      });
    }
    return this.fileService.uploadFile(file, user, dictionary);
  }

  @UseGuards(JwtGuard)
  @ApiOperation({ summary: 'Upload txt file' })
  @Get('user/:id')
  getFilesByUserId(@Param() { id }: FindByIdParams) {
    return this.fileService.getFilesByUserId(Number(id));
  }
}
