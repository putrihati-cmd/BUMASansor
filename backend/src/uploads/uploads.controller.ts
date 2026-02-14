import {
  BadRequestException,
  Controller,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { promises as fs } from 'fs';
import { randomUUID } from 'crypto';
import { extname, isAbsolute, join } from 'path';
import { memoryStorage } from 'multer';

function resolveUploadDir(value: string | undefined): string {
  if (!value || value.trim().length === 0) {
    return join(process.cwd(), 'uploads');
  }
  if (isAbsolute(value)) {
    return value;
  }
  return join(process.cwd(), value);
}

function extForMime(mimeType: string): string {
  if (mimeType === 'image/png') return '.png';
  if (mimeType === 'image/jpeg') return '.jpg';
  return '';
}

@Controller('uploads')
@UseGuards(JwtAuthGuard)
export class UploadsController {
  constructor(private readonly configService: ConfigService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
    }),
  )
  async upload(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({
            maxSize:
              Number(process.env.MAX_FILE_SIZE) ||
              Number(process.env.MAX_FILE_SIZE_BYTES) ||
              10 * 1024 * 1024,
          }),
        ],
        fileIsRequired: true,
      }),
    )
    file: { originalname: string; mimetype: string; buffer: Buffer },
  ) {
    const originalExt = extname(file.originalname).toLowerCase();
    const allowedExt = ['.png', '.jpg', '.jpeg'];
    const allowed =
      file.mimetype.startsWith('image/') || (originalExt.length > 0 && allowedExt.includes(originalExt));

    if (!allowed) {
      throw new BadRequestException('Only image uploads are supported.');
    }

    const uploadDir = resolveUploadDir(this.configService.get<string>('UPLOAD_DIR'));
    await fs.mkdir(uploadDir, { recursive: true });

    const ext = originalExt || extForMime(file.mimetype) || '.bin';
    const filename = `${randomUUID()}${ext}`;

    await fs.writeFile(join(uploadDir, filename), file.buffer);

    const relativePath = `/uploads/${filename}`;
    const appUrl = this.configService.get<string>('APP_URL')?.replace(/\/+$/, '');

    return {
      filename,
      path: relativePath,
      url: appUrl ? `${appUrl}${relativePath}` : relativePath,
    };
  }
}
