import { DocumentsService } from './documents.service';
import { NotFoundException } from '@nestjs/common';

interface Doc {
  id: string;
  originalName: string;
  filename: string;
  ingestionId?: string;
}

const mockDocDb: Doc[] = [];
let docIdCounter = 1;
const mockPrismaService = {
  document: {
    create: jest.fn(({ data }) => {
      const doc: Doc = {
        id: (docIdCounter++).toString(),
        originalName: data.originalName,
        filename: data.filename,
        ingestionId: data.ingestionId ?? 'ing-1',
      };
      mockDocDb.push(doc);
      return doc;
    }),
    findUnique: jest.fn(({ where }) => {
      const found = mockDocDb.find((d) => d.id === where.id);
      return found ?? null;
    }),
    findMany: jest.fn(() => mockDocDb),
    update: jest.fn(({ where, data }) => {
      const doc = mockDocDb.find((d) => d.id === where.id);
      if (!doc) return null;
      doc.filename = data.filename;
      doc.originalName = data.originalName;
      return doc;
    }),
    delete: jest.fn(({ where }) => {
      const idx = mockDocDb.findIndex((d) => d.id === where.id);
      if (idx !== -1) {
        mockDocDb.splice(idx, 1);
        return { message: 'Document deleted successfully', id: where.id };
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

  it('should throw NotFoundException if document is deleted before update', async () => {
    const doc = await documentsService.create(mockFile);
    await documentsService.delete(doc.id);
    await expect(documentsService.update(doc.id, mockFile)).rejects.toThrow(
      'Document not found',
    );
  });

  it('should throw NotFoundException if document is deleted before delete', async () => {
    const doc = await documentsService.create(mockFile);
    await documentsService.delete(doc.id);
    await expect(documentsService.delete(doc.id)).rejects.toThrow(
      'Document not found',
    );
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

  it('should return empty string if ingestionId is missing or undefined', async () => {
    const doc = mockPrismaService.document.create({
      data: {
        originalName: 'noingest.pdf',
        filename: 'file-999.pdf',
        ingestionId: undefined,
      },
    });
    delete doc.ingestionId;
    const ingestionId = await documentsService.getIngestionIdByDocumentId(
      doc.id,
    );
    expect(ingestionId).toBe('');
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

  it('should throw NotFoundException if update called with invalid id', async () => {
    await expect(
      documentsService.update('not-found', mockFile),
    ).rejects.toThrow('Document not found');
  });

  it('should delete a document', async () => {
    const doc = await documentsService.create(mockFile);
    const result = await documentsService.delete(doc.id);
    expect(result).toHaveProperty('message', 'Document deleted successfully');
    await expect(documentsService.findOne(doc.id)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should throw NotFoundException if delete called with invalid id', async () => {
    await expect(documentsService.delete('not-found')).rejects.toThrow(
      'Document not found',
    );
  });

  it('should throw NotFoundException if document is deleted before update', async () => {
    const doc = await documentsService.create(mockFile);
    await documentsService.delete(doc.id);
    await expect(documentsService.update(doc.id, mockFile)).rejects.toThrow(
      'Document not found',
    );
  });

  it('should throw NotFoundException if document is deleted before delete', async () => {
    const doc = await documentsService.create(mockFile);
    await documentsService.delete(doc.id);
    await expect(documentsService.delete(doc.id)).rejects.toThrow(
      'Document not found',
    );
  });
});
