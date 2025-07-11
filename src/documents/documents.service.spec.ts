import { DocumentsService } from './documents.service';
import { IngestionService } from '../ingestion/ingestion.service';
import { NotFoundException } from '@nestjs/common';

describe('DocumentsService', () => {
  let documentsService: DocumentsService;
  let ingestionService: IngestionService;

  beforeEach(() => {
    ingestionService = new IngestionService();
    documentsService = new DocumentsService(ingestionService);
  });

  const mockFile = {
    originalname: 'test.pdf',
    filename: 'file-123.pdf',
  } as Express.Multer.File;

  it('should create a document and link ingestion', () => {
    const doc = documentsService.create(mockFile);
    expect(doc).toHaveProperty('id');
    expect(doc.originalName).toBe('test.pdf');
    expect(doc.filename).toBe('file-123.pdf');
    expect(doc.ingestionId).toBeDefined();
  });

  it('should find a document by ID', () => {
    const doc = documentsService.create(mockFile);
    const found = documentsService.findOne(doc.id);
    expect(found.id).toBe(doc.id);
  });

  it('should throw if document not found', () => {
    expect(() => documentsService.findOne('not-found')).toThrow(
      NotFoundException,
    );
  });

  it('should return ingestionId by document ID', () => {
    const doc = documentsService.create(mockFile);
    const ingestionId = documentsService.getIngestionIdByDocumentId(doc.id);
    expect(ingestionId).toBe(doc.ingestionId);
  });
});
