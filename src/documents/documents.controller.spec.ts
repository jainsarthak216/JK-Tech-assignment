/* eslint-disable */
import { Test, TestingModule } from '@nestjs/testing';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { IngestionService } from '../ingestion/ingestion.service';
import { JwtAuthGuard } from '../auth/jwt-auth/jwt-auth.guard';
import { NotFoundException } from '@nestjs/common';

const mockAuthGuard = {
  canActivate: () => true,
};

describe('DocumentsController', () => {
  let controller: DocumentsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DocumentsController],
      providers: [DocumentsService, IngestionService],
    })
      .overrideProvider(JwtAuthGuard)
      .useValue(mockAuthGuard)
      .compile();

    controller = module.get<DocumentsController>(DocumentsController);
  });

  const mockFile = {
    originalname: 'test.pdf',
    filename: 'file-123.pdf',
  } as Express.Multer.File;

  it('should upload a file and return a document', () => {
    const result = controller.uploadFile(mockFile);
    expect(result).toHaveProperty('id');
    expect(result.originalName).toBe('test.pdf');
  });

  it('should return all documents', () => {
    controller.uploadFile(mockFile);
    const all = controller.getAll();
    expect(all.length).toBeGreaterThan(0);
  });

  it('should return a document by ID', () => {
    const doc = controller.uploadFile(mockFile);
    const found = controller.getOne(doc.id);
    expect(found.id).toBe(doc.id);
  });

  it('should return ingestion status for a document', () => {
    const doc = controller.uploadFile(mockFile);
    const status = controller.getIngestionStatus(doc.id);
    expect(status).toHaveProperty('status');
  });

  it('should throw NotFoundException for missing doc ingestion', () => {
    expect((): any => controller.getIngestionStatus('invalid-id')).toThrow(
      NotFoundException,
    );
  });
});
