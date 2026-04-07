import { Controller, Post, Body } from '@nestjs/common';
import { RecommendationService } from './recommendation.service';
import { CompareServicesDto } from './dto/compare-services.dto';

@Controller('servicio/recommendation')
export class RecommendationController {
  constructor(private readonly recommendationService: RecommendationService) {}

  @Post('compare')
  compareServices(@Body() body: CompareServicesDto) {
    return this.recommendationService.compare(body.ids, body.filters);
  }
}
