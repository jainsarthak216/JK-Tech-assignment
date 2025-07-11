import { IngestionService } from './ingestion.service';
import { NotFoundException } from '@nestjs/common';

describe('IngestionService', () => {
  let service: IngestionService;

  beforeEach(() => {
    service = new IngestionService();
  });

  it('should trigger a new ingestion and return valid status', () => {
    const result = service.triggerIngestion();
    expect(result).toHaveProperty('id');
    expect(result.status).toBe('in_progress');
    expect(result.startedAt).toBeInstanceOf(Date);
  });

  it('should return status of a valid ingestion', () => {
    const { id } = service.triggerIngestion();
    const status = service.getStatus(id);
    expect(status.id).toBe(id);
  });

  it('should throw NotFoundException for invalid ingestion ID', () => {
    expect(() => service.getStatus('invalid-id')).toThrow(NotFoundException);
  });
});
