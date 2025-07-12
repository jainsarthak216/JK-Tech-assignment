import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Get,
  Param,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentsService } from './documents.service';
import { JwtAuthGuard } from '../auth/jwt-auth/jwt-auth.guard';
import { IngestionService } from '../ingestion/ingestion.service';
import { Express } from 'express';

@Controller('documents')
@UseGuards(JwtAuthGuard)
export class DocumentsController {
  constructor(
    private readonly documentsService: DocumentsService,
    private readonly ingestionService: IngestionService,
  ) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    return this.documentsService.create(file);
  }

  @Get()
  getAll() {
    return this.documentsService.findAll();
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.documentsService.findOne(id);
  }

  @Get(':id/ingestion')
  async getIngestionStatus(@Param('id') id: string): Promise<any> {
    const ingestionId =
      await this.documentsService.getIngestionIdByDocumentId(id);
    return this.ingestionService.getStatus(ingestionId);
  }
}
