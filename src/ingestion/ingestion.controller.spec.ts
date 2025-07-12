/* eslint-disable */
import { Test, TestingModule } from '@nestjs/testing';
import { IngestionController } from './ingestion.controller';
import { IngestionService } from './ingestion.service';
import { JwtAuthGuard } from '../auth/jwt-auth/jwt-auth.guard';

const mockIngestionService = {
  triggerIngestion: jest.fn(() => ({ id: 'ing-1', status: 'in_progress' })),
  getStatus: jest.fn((id) => ({ id, status: 'completed' })),
};
const mockAuthGuard = {
  canActivate: () => true,
};

describe('IngestionController', () => {
  let controller: IngestionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IngestionController],
      providers: [
        { provide: IngestionService, useValue: mockIngestionService },
      ],
    })
      .overrideProvider(JwtAuthGuard)
      .useValue(mockAuthGuard)
      .compile();

    controller = module.get<IngestionController>(IngestionController);
  });

  it('should trigger ingestion and return status', () => {
    const result = controller.triggerIngestion();
    expect(result).toHaveProperty('id');
    expect(result.status).toBe('in_progress');
  });

  it('should return ingestion status by ID', async () => {
    const { id } = mockIngestionService.triggerIngestion();
    const status = await controller.getIngestionStatus(id);
    expect(status.id).toBe(id);
  });
});
