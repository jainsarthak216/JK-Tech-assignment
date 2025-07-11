import { Controller, Post, Get, Param, UseGuards } from '@nestjs/common';
import { IngestionService } from './ingestion.service';
import { JwtAuthGuard } from '../auth/jwt-auth/jwt-auth.guard';

@Controller('ingestion')
@UseGuards(JwtAuthGuard)
export class IngestionController {
  constructor(private readonly ingestionService: IngestionService) {}

  @Post('trigger')
  triggerIngestion(): any {
    return this.ingestionService.triggerIngestion();
  }

  @Get('status/:id')
  getIngestionStatus(@Param('id') id: string): any {
    return this.ingestionService.getStatus(id);
  }
}
