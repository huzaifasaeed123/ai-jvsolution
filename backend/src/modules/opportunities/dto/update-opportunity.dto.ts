import { PartialType } from '@nestjs/swagger';
import { CreateOpportunityDto } from './create-opportunity.dto';

/** All create fields, optional. Status/verification change via dedicated endpoints. */
export class UpdateOpportunityDto extends PartialType(CreateOpportunityDto) {}
