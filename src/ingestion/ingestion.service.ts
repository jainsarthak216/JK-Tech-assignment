import { Injectable, NotFoundException } from '@nestjs/common';
import { v4 as uuid } from 'uuid';

interface IngestionStatus {
  id: string;
  status: 'pending' | 'in_progress' | 'completed';
  startedAt: Date;
  completedAt?: Date;
}

@Injectable()
export class IngestionService {
  private readonly ingestions: IngestionStatus[] = [];

  triggerIngestion(): IngestionStatus {
    const newIngestion: IngestionStatus = {
      id: uuid(),
      status: 'in_progress',
      startedAt: new Date(),
    };
    this.ingestions.push(newIngestion);

    // Simulate async completion
    setTimeout(() => {
      const i = this.ingestions.find((ing) => ing.id === newIngestion.id);
      if (i) {
        i.status = 'completed';
        i.completedAt = new Date();
      }
    }, 3000);

    return newIngestion;
  }

  getStatus(id: string): IngestionStatus {
    const ingestion = this.ingestions.find((i) => i.id === id);
    if (!ingestion) throw new NotFoundException('Ingestion not found');
    return ingestion;
  }
}
