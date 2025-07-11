import { Injectable, NotFoundException } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import { Express } from 'express';
import { IngestionService } from '../ingestion/ingestion.service';

export interface DocumentEntry {
  id: string;
  filename: string;
  originalName: string;
  uploadedAt: Date;
  ingestionId: string;
}

@Injectable()
export class DocumentsService {
  private readonly documents: DocumentEntry[] = [];

  constructor(private readonly ingestionService: IngestionService) {}

  create(file: Express.Multer.File): DocumentEntry {
    const ingestion = this.ingestionService.triggerIngestion();

    const doc: DocumentEntry = {
      id: uuid(),
      filename: file.filename,
      originalName: file.originalname,
      uploadedAt: new Date(),
      ingestionId: ingestion.id,
    };
    this.documents.push(doc);
    return doc;
  }

  findAll(): DocumentEntry[] {
    return this.documents;
  }

  findOne(id: string): DocumentEntry {
    const doc = this.documents.find((d) => d.id === id);
    if (!doc) throw new NotFoundException('Document not found');
    return doc;
  }

  getIngestionIdByDocumentId(id: string): string {
    return this.findOne(id).ingestionId;
  }
}
