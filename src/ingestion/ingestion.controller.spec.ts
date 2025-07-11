/* eslint-disable */
import { Test, TestingModule } from '@nestjs/testing';
import { IngestionController } from './ingestion.controller';
import { IngestionService } from './ingestion.service';
import { JwtAuthGuard } from '../auth/jwt-auth/jwt-auth.guard';

// Bypass auth guard for unit test
const mockAuthGuard = {
  canActivate: () => true,
};

describe('IngestionController', () => {
  let controller: IngestionController;
  let service: IngestionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IngestionController],
      providers: [IngestionService],
    })
      .overrideProvider(JwtAuthGuard)
      .useValue(mockAuthGuard)
      .compile();

    controller = module.get<IngestionController>(IngestionController);
    service = module.get<IngestionService>(IngestionService);
  });

  it('should trigger ingestion and return status', () => {
    const result = controller.triggerIngestion();
    expect(result).toHaveProperty('id');
    expect(result.status).toBe('in_progress');
  });

  it('should return ingestion status by ID', () => {
    const { id } = service.triggerIngestion();
    const status = controller.getIngestionStatus(id);
    expect(status.id).toBe(id);
  });
});
