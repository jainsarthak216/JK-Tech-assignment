import { DocumentsService } from './documents.service';
import { IngestionService } from '../ingestion/ingestion.service';
import { NotFoundException } from '@nestjs/common';

const mockDocDb: any[] = [];
const mockPrismaService = {
  document: {
    create: jest.fn(({ data }) => {
      const doc = { ...data };
      mockDocDb.push(doc);
      return doc;
    }),
    findUnique: jest.fn(({ where }) =>
      mockDocDb.find((d) => d.id === where.id),
    ),
    findMany: jest.fn(() => mockDocDb),
    update: jest.fn(({ where, data }) => {
      const doc = mockDocDb.find((d) => d.id === where.id);
      if (doc) Object.assign(doc, data);
      return doc;
    }),
    delete: jest.fn(({ where }) => {
      const idx = mockDocDb.findIndex((d) => d.id === where.id);
      if (idx !== -1) {
        const doc = mockDocDb.splice(idx, 1)[0];
        return doc;
      }
      return null;
    }),
  },
};

const mockIngestionService = {
  triggerIngestion: jest.fn(() => ({ id: 'ing-1' })),
  getStatus: jest.fn((id) => ({ id, status: 'completed' })),
};

describe('DocumentsService', () => {
  let documentsService: DocumentsService;
  let ingestionService: typeof mockIngestionService;
  let prismaService: typeof mockPrismaService;

  beforeEach(() => {
    prismaService = mockPrismaService;
    ingestionService = mockIngestionService;
    mockDocDb.length = 0;
    documentsService = new DocumentsService(
      prismaService as any,
      ingestionService as any,
    );
  });

  const mockFile = {
    originalname: 'test.pdf',
    filename: 'file-123.pdf',
  } as Express.Multer.File;

  it('should create a document and link ingestion', async () => {
    const doc = await documentsService.create(mockFile);
    expect(doc).toHaveProperty('id');
    expect(doc.originalName).toBe('test.pdf');
    expect(doc.filename).toBe('file-123.pdf');
    expect(doc.ingestionId).toBeDefined();
  });

  it('should find a document by ID', async () => {
    const doc = await documentsService.create(mockFile);
    const found = await documentsService.findOne(doc.id);
    expect(found.id).toBe(doc.id);
  });

  it('should throw if document not found', async () => {
    await expect(documentsService.findOne('not-found')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should return ingestionId by document ID', async () => {
    const doc = await documentsService.create(mockFile);
    const ingestionId = await documentsService.getIngestionIdByDocumentId(
      doc.id,
    );
    expect(ingestionId).toBe(doc.ingestionId);
  });

  it('should find all documents', async () => {
    await documentsService.create(mockFile);
    const docs = await documentsService.findAll();
    expect(Array.isArray(docs)).toBe(true);
    expect(docs.length).toBeGreaterThan(0);
  });

  it('should update a document', async () => {
    const doc = await documentsService.create(mockFile);
    const updated = await documentsService.update(doc.id, mockFile);
    expect(updated.id).toBe(doc.id);
    expect(updated.filename).toBe('file-123.pdf');
  });

  it('should throw if update called with invalid id', async () => {
    await expect(
      documentsService.update('not-found', mockFile),
    ).rejects.toThrow(NotFoundException);
  });

  it('should delete a document', async () => {
    const doc = await documentsService.create(mockFile);
    const result = await documentsService.delete(doc.id);
    expect(result).toHaveProperty('message', 'Document deleted successfully');
    await expect(documentsService.findOne(doc.id)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should throw if delete called with invalid id', async () => {
    await expect(documentsService.delete('not-found')).rejects.toThrow(
      NotFoundException,
    );
  });
});
