import { Injectable, NotFoundException } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class IngestionService {
  constructor(private readonly prisma: PrismaService) {}

  async triggerIngestion() {
    const ingestion = await this.prisma.ingestion.create({
      data: {
        id: uuid(),
        status: 'in_progress',
        startedAt: new Date(),
      },
    });

    setTimeout(() => {
      this.prisma.ingestion
        .update({
          where: { id: ingestion.id },
          data: {
            status: 'completed',
            completedAt: new Date(),
          },
        })
        .catch((err) => {
          console.error('Error updating ingestion:', err);
        });
    }, 3000);

    return ingestion;
  }

  async getStatus(id: string) {
    const ingestion = await this.prisma.ingestion.findUnique({ where: { id } });
    if (!ingestion) throw new NotFoundException('Ingestion not found');
    return ingestion;
  }
}
