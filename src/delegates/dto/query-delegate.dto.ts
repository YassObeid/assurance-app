import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class QueryDelegateDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Search by delegate name or phone',
    example: 'John',
  })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({
    description: 'Filter by region ID',
    example: 'region-uuid',
  })
  @IsOptional()
  @IsString()
  regionId?: string;
}
