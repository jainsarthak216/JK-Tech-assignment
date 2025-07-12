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
import { Roles } from '../common/roles/roles.decorator';

@Controller('documents')
@UseGuards(JwtAuthGuard)
export class DocumentsController {
  constructor(
    private readonly documentsService: DocumentsService,
    private readonly ingestionService: IngestionService,
  ) {}

  @Post('upload')
  @Roles('editor', 'admin')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    return await this.documentsService.create(file);
  }

  @Get()
  @Roles('viewer', 'editor', 'admin')
  async getAll() {
    return await this.documentsService.findAll();
  }

  @Get(':id')
  @Roles('viewer', 'editor', 'admin')
  async getOne(@Param('id') id: string) {
    return await this.documentsService.findOne(id);
  }

  @Post()
  @Roles('editor', 'admin')
  async createDocument(@UploadedFile() file: Express.Multer.File) {
    return await this.documentsService.create(file);
  }

  @Post(':id')
  @Roles('editor', 'admin')
  async updateDocument(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return await this.documentsService.update(id, file);
  }

  @Post(':id/delete')
  @Roles('admin')
  async deleteDocument(@Param('id') id: string) {
    return await this.documentsService.delete(id);
  }

  @Get(':id/ingestion')
  @Roles('viewer', 'editor', 'admin')
  async getIngestionStatus(@Param('id') id: string): Promise<any> {
    const ingestionId =
      await this.documentsService.getIngestionIdByDocumentId(id);
    return this.ingestionService.getStatus(ingestionId);
  }
}
