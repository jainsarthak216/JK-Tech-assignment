import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { IngestionService } from '../ingestion/ingestion.service';
import { v4 as uuid } from 'uuid';
import { Document } from '@prisma/client';

@Injectable()
export class DocumentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ingestionService: IngestionService,
  ) {}

  async create(file: Express.Multer.File): Promise<Document> {
    const ingestion = this.ingestionService.triggerIngestion();

    return await this.prisma.document.create({
      data: {
        id: uuid(),
        filename: file.filename,
        originalName: file.originalname,
        ingestionId: (await ingestion).id,
      },
    });
  }

  async findAll(): Promise<Document[]> {
    return this.prisma.document.findMany();
  }

  async findOne(id: string): Promise<Document> {
    const doc = await this.prisma.document.findUnique({ where: { id } });
    if (!doc) throw new NotFoundException('Document not found');
    return doc;
  }

  async getIngestionIdByDocumentId(id: string): Promise<string> {
    const doc = await this.findOne(id);
    return doc.ingestionId ?? '';
  }
}
