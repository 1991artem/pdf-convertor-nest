import { UploadBody } from './dto/index';
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
import { rootPath } from '../../app.module';
import { FindByIdBody, IDictionary } from './dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UserService } from '../user/user.service';

@Injectable()
export class FileService {
  constructor(
    @InjectRepository(File) private _filesRepository: Repository<File>,
    private userService: UserService,
  ) {}

  async uploadFile(file: Express.Multer.File, body: UploadBody) {
    try {
      const { userKey, fileName } = body;

      const { value, warnings } = await this.withChoiceFormat(file);
      if (!value) {
        return {
          warnings,
        };
      }

      const tags = await this.getDictionary(value);
      await this.saveFileInStorage(file, fileName, userKey);

      await this.saveFileInDb(fileName, Number(userKey));

      return {
        message: `File has been saved`,
        file: fileName,
        value,
        tags,
      };
    } catch (e) {
      throw new HttpException(
        (e as HttpException).message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  downloadPDFFileFromStorage(fileName: string, userKey: string) {
    try {
      const destPath = join(rootPath, userKey, fileName);
      return destPath;
    } catch (e) {
      throw new HttpException(
        (e as HttpException).message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async downloadFileFromStorage(fileName: string, userKey: string) {
    try {
      const destPath = join(rootPath, userKey, fileName);
      const file = fs.readFileSync(destPath);
      const upload: Partial<Express.Multer.File> = {
        originalname: fileName,
        buffer: file,
      };
      const { value, warnings } = await this.withChoiceFormat(upload);
      if (!value) {
        return {
          warnings,
        };
      }
      const tags = await this.getDictionary(value);

      return {
        message: `File has been downloaded`,
        file: fileName,
        value,
        tags,
        test: file,
      };
    } catch (e) {
      throw new HttpException(
        (e as HttpException).message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getDictionary(value: string) {
    const reg = new RegExp(/{\[(.*?)\]}/, 'g');
    const tags = new Set();
    [...value.matchAll(reg)].forEach((tag) => tags.add(tag[0]));
    return Array.from(tags);
  }

  async withChoiceFormat(file: Partial<Express.Multer.File>) {
    const { buffer, originalname } = file;

    if (!originalname || !buffer) {
      return { value: '', warnings: 'Invalid file' };
    }

    const ext = extname(originalname);
    switch (ext) {
      case '.doc':
      case '.docx':
        return await this.convertDocToHtml(buffer);

      case '.txt':
      case '.html':
        const value = iconv.decode(buffer, 'win1251');
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

  async convertFileToPDF(
    template: string,
    dictionary: IDictionary,
    userKey: string,
  ) {
    const html = await this.textParser(template, dictionary);
    const fileName = await this.generatePDF(html, userKey);
    await this.saveFileInDb(fileName, Number(userKey), true);
    return {
      message: `File has been converted`,
      fileName,
    };
  }

  async generatePDF(template: string, userKey: string) {
    const fileName = 'PDF_' + uuid.v4() + '.pdf';

    const destPath = join(rootPath, userKey, fileName);

    const options: CreateOptions = {
      format: 'A4',
      border: '25px',
    };

    pdf.create(template, options).toStream((err, stream) => {
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

  async textParser(text: string, dictionary: IDictionary) {
    let result = text;
    for (const tag in dictionary) {
      const value = dictionary[tag];
      result = result.replaceAll(tag, value);
    }
    return `<html><head><meta charset=\"UTF-8\"></head><body>${result}</body></html>`;
  }

  async saveFileInStorage(
    file: Express.Multer.File,
    fileName: string,
    userKey: string,
  ) {
    const destPathDir = join(rootPath, userKey);

    if (!fs.existsSync(destPathDir)) {
      await mkdir(destPathDir, { recursive: true });
    }

    const destPath = join(rootPath, userKey, fileName);
    const stream = fs.createWriteStream(destPath);
    stream.write(file.buffer);
  }

  async saveFileInDb(name: string, id: number, converted = false) {
    const user = await this.userService.getUserById(id);
    if (!user) {
      throw new NotFoundException({ message: 'User not found' });
    }
    const fileInDb = await this._filesRepository.findOne({
      where: { name },
    });

    if (!fileInDb) {
      const file = this._filesRepository.create({
        name,
        user,
        converted,
        path: rootPath,
      });
      file.save();
    } else {
      const updateBody = {
        updatedAt: new Date(),
      };
      await this._filesRepository
        .createQueryBuilder()
        .update(File)
        .returning('*')
        .updateEntity(true)
        .set(updateBody)
        .where({ name })
        .execute();
    }
  }

  async getFilesByUserId(body: FindByIdBody) {
    const { userKey, converted, offset, limit, sort, type } = body;
    const [files, amount] = await this._filesRepository.findAndCount({
      where: {
        user: {
          id: Number(userKey),
        },
        converted,
      },
      skip: offset ? Number(offset) : 0,
      take: limit ? Number(limit) : 10,
      order: sort
        ? {
            [sort]: type,
          }
        : undefined,
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
        converted: file.converted,
      };
    });
    return {
      amount,
      result,
    };
  }
}
