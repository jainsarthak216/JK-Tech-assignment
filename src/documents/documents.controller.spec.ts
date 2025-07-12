/* eslint-disable */
import { Test, TestingModule } from '@nestjs/testing';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { IngestionService } from '../ingestion/ingestion.service';
import { JwtAuthGuard } from '../auth/jwt-auth/jwt-auth.guard';
import { NotFoundException } from '@nestjs/common';

const mockDocumentsService = {
  create: jest.fn(async (file) => ({ id: '1', originalName: file.originalname, filename: file.filename, ingestionId: 'ing-1' })),
  findAll: jest.fn(async () => [{ id: '1', originalName: 'test.pdf', filename: 'file-123.pdf', ingestionId: 'ing-1' }]),
  findOne: jest.fn(async (id) => id === '1' ? { id: '1', originalName: 'test.pdf', filename: 'file-123.pdf', ingestionId: 'ing-1' } : null),
  getIngestionIdByDocumentId: jest.fn(async (id) => id === '1' ? 'ing-1' : (() => { throw new NotFoundException('Document not found'); })()),
  update: jest.fn(async (id, file) => id === '1' ? { id: '1', originalName: file.originalname, filename: file.filename, ingestionId: 'ing-1' } : null),
  delete: jest.fn(async (id) => id === '1' ? { message: 'Document deleted successfully', id: '1' } : null),
};

const mockIngestionService = {
  getStatus: jest.fn(async (ingestionId) => {
    if (ingestionId === 'ing-1') return { status: 'completed' };
    throw new NotFoundException('Ingestion not found');
  }),
};
const mockAuthGuard = {
  canActivate: () => true,
};

describe('DocumentsController', () => {
  let controller: DocumentsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DocumentsController],
      providers: [
        { provide: DocumentsService, useValue: mockDocumentsService },
        { provide: IngestionService, useValue: mockIngestionService },
      ],
    })
      .overrideProvider(JwtAuthGuard)
      .useValue(mockAuthGuard)
      .compile();

    controller = module.get<DocumentsController>(DocumentsController);
  });
  
  it('should be defined and module should setup', () => {
    expect(controller).toBeDefined();
  });

  const mockFile = {
    originalname: 'test.pdf',
    filename: 'file-123.pdf',
  } as Express.Multer.File;

  it('should upload a file and return a document', async () => {
    const result = await controller.uploadFile(mockFile);
    expect(result).toHaveProperty('id');
    expect(result.originalName).toBe('test.pdf');
  });

  it('should return all documents', async () => {
    controller.uploadFile(mockFile);
    const all = await controller.getAll();
    expect(all.length).toBeGreaterThan(0);
  });

  it('should return a document by ID', async () => {
    const doc = await controller.uploadFile(mockFile);
    const found = await controller.getOne(doc.id);
    expect(found.id).toBe(doc.id);
  });

  it('should return ingestion status for a document', async () => {
    const doc = await controller.uploadFile(mockFile);
    const status = await controller.getIngestionStatus(doc.id);
    expect(status).toHaveProperty('status');
  });

  it('should throw NotFoundException for missing doc ingestion', async () => {
    await expect(controller.getIngestionStatus('invalid-id')).rejects.toThrow(NotFoundException);
  });
});
