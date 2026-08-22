import { PartialType } from '@nestjs/swagger';
import { CreateDueDiligenceItemDto } from './create-item.dto';

export class UpdateDueDiligenceItemDto extends PartialType(CreateDueDiligenceItemDto) {}
