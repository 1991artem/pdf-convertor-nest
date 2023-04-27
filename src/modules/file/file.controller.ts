import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseFilePipeBuilder,
  Post,
  Query,
  Res,
  UploadedFile,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { FileService } from './file.service';
import {
  ConvertFileBody,
  FindByIdBody,
  UploadBody,
  UploadBodyFromStorage,
  UploadPDFParams,
  UploadPDFQuery,
} from './dto';

@ApiTags('File')
@Controller('api/file')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @ApiOperation({ summary: 'Upload txt file' })
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(
    @UploadedFile(new ParseFilePipeBuilder().build())
    file: Express.Multer.File,
    @Body(new ValidationPipe()) { body }: { body: UploadBody },
  ) {
    return this.fileService.uploadFile(file, body);
  }

  @ApiOperation({ summary: 'Get list files by user id' })
  @HttpCode(200)
  @Post()
  getFilesByUserId(@Body(new ValidationPipe()) body: FindByIdBody) {
    return this.fileService.getFilesByUserId(body);
  }

  @ApiOperation({ summary: 'Download file from storage' })
  @Post('download/storage')
  downloadFileFromStorage(
    @Body(new ValidationPipe()) body: UploadBodyFromStorage,
  ) {
    return this.fileService.downloadFileFromStorage(
      body.fileName,
      body.userKey,
    );
  }

  @ApiOperation({ summary: 'Download PDF file from storage' })
  @Get('download/pdf/:fileName')
  downloadPDFFileFromStorage(
    @Res() response: Response,
    @Param() { fileName }: UploadPDFParams,
    @Query() { key }: UploadPDFQuery,
  ) {
    const path = this.fileService.downloadPDFFileFromStorage(
      fileName,
      key,
    );
    response.sendFile(path);
  }

  @ApiOperation({ summary: 'Convert file to PDF' })
  @Post('convert')
  convertFileToPDF(
    @Body(new ValidationPipe())
    { template, dictionary, userKey }: ConvertFileBody,
  ) {
    return this.fileService.convertFileToPDF(template, dictionary, userKey);
  }
}
