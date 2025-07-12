import { IngestionService } from './ingestion.service';
import { NotFoundException } from '@nestjs/common';

const mockIngestionDb: any[] = [];
const mockPrismaService = {
  ingestion: {
    create: jest.fn(({ data }) => {
      const ingestion = { ...data, id: 'ing-' + (mockIngestionDb.length + 1) };
      mockIngestionDb.push(ingestion);
      return ingestion;
    }),
    findUnique: jest.fn(({ where }) =>
      mockIngestionDb.find((i) => i.id === where.id),
    ),
  },
};

describe('IngestionService', () => {
  let service: IngestionService;
  let prismaService: typeof mockPrismaService;

  beforeEach(() => {
    prismaService = mockPrismaService;
    mockIngestionDb.length = 0;
    service = new IngestionService(prismaService as any);
  });

  it('should trigger a new ingestion and return valid status', async () => {
    const result = await service.triggerIngestion();
    expect(result).toHaveProperty('id');
    expect(result.status).toBe('in_progress');
    expect(result.startedAt).toBeInstanceOf(Date);
  });

  it('should return status of a valid ingestion', async () => {
    const { id } = await service.triggerIngestion();
    const status = await service.getStatus(id);
    expect(status.id).toBe(id);
  });

  it('should throw NotFoundException for invalid ingestion ID', async () => {
    await expect(service.getStatus('invalid-id')).rejects.toThrow(
      NotFoundException,
    );
  });
});
