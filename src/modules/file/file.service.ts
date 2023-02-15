import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import mammoth from 'mammoth';
import { Repository } from 'typeorm';
import pdf, { CreateOptions } from 'html-pdf';
import iconv from 'iconv-lite';
import { mkdir } from 'node:fs/promises';
import * as fs from 'fs';
import { extname, join } from 'node:path';
import * as uuid from 'uuid';
import File from './entities';
import { IUserRequest } from '../../types/express';
import { rootPath } from '../../app.module';
import { IDictionary } from './dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UserService } from '../user/user.service';

@Injectable()
export class FileService {
  constructor(
    @InjectRepository(File) private _filesRepository: Repository<File>,
    private userService: UserService,
  ) {}

  async uploadFile(
    file: Express.Multer.File,
    user: IUserRequest,
    dictionary: IDictionary[],
  ) {
    try {
      const { value, warnings } = await this.choiceFormat(file);
      if (!value) {
        return {
          warnings,
        };
      }
      const template = await this.textParser(value, dictionary);
      const fileName = await this.generatePDF(template);

      await this.saveFileInDb(fileName, Number(user.id));

      return {
        message: `File has been writed`,
        file: fileName,
        warnings,
      };
    } catch (e) {
      throw new HttpException(
        (e as HttpException).message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  async choiceFormat(file: Express.Multer.File) {
    const buffer = file.buffer;
    const ext = extname(file.originalname);
    switch (ext) {
      case '.doc':
      case '.docx':
        return await this.convertDocToHtml(buffer);

      case '.txt':
      case '.html':
        const value = iconv.decode(file.buffer, 'win1251');
        return { value, warnings: '' };
      default:
        return { value: '', warnings: 'Invalid file format' };
    }
  }
  async convertDocToHtml(buffer: Buffer) {
    const result = await mammoth.convertToHtml({ buffer });
    return {
      value: result.value,
      warnings: result.messages.join(' '),
    };
  }

  async generatePDF(template: string) {
    const fileName = 'PDF_' + uuid.v4() + '.pdf';

    const destPath = join(rootPath, fileName);

    if (!fs.existsSync(rootPath)) {
      await mkdir(rootPath, { recursive: true });
    }

    const options: CreateOptions = {
      format: 'A4',
      border: '25px',
    };

    pdf.create(template, options).toStream(function (err, stream) {
      if (err) {
        throw new HttpException(
          (err as HttpException).message,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      stream.pipe(fs.createWriteStream(destPath));
    });

    return fileName;
  }

  async textParser(text: string, dictionary: IDictionary[]) {
    let result = text;
    dictionary.forEach((tag: IDictionary) => {
      const key = Object.keys(tag)[0];
      const value = Object.values(tag)[0];
      const reg = `%${key}%`;
      result = result.replaceAll(reg, value);
    });
    return `<html><head><meta charset=\"UTF-8\"></head><body>${result}</body></html>`;
  }

  async saveFileInDb(name: string, id: number) {
    const user = await this.userService.getUserById(id);
    if (!user) {
      throw new NotFoundException({ message: 'User not found' });
    }
    const file = await this._filesRepository.create({
      name,
      user,
      path: rootPath,
    });
    file.save();
  }

  async getFilesByUserId(userId: number) {
    const files = await this._filesRepository.find({
      where: {
        user: {
          id: userId,
        },
      },
      relations: {
        user: true,
      },
    });
    const result = files.map((file: File) => {
      return {
        id: file.id,
        fileName: file.name,
        path: file.path,
        createdAt: file.createdAt,
        user: file.user.email,
      };
    });
    return result;
  }
}
