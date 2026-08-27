import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { structuresByGroup } from '../../common/reference/structure-library';
import { STRUCTURES } from '../../common/reference/opportunity-reference';

@ApiTags('structures')
@Controller('structures')
export class StructuresController {
  @Public()
  @Get()
  @ApiOperation({ summary: 'Public structure library grouped by family (labels + editorial)' })
  list() {
    const labels = new Map(STRUCTURES.map((s) => [s.code, s.label]));
    const groups = structuresByGroup().map((g) => ({
      code: g.code,
      label: g.label,
      blurb: g.blurb,
      entries: g.entries.map((e) => ({ ...e, label: labels.get(e.code) ?? e.code })),
    }));
    return {
      groups,
      documented: groups.reduce((n, g) => n + g.entries.length, 0),
      totalSupported: STRUCTURES.length,
    };
  }
}
