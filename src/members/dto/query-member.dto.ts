import { IsOptional, IsIn, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class QueryMemberDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Search by member name or CIN',
    example: 'John',
  })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({
    description: 'Filter by member status',
    enum: ['ACTIVE', 'SUSPENDED', 'CANCELLED'],
    example: 'ACTIVE',
  })
  @IsOptional()
  @IsIn(['ACTIVE', 'SUSPENDED', 'CANCELLED'])
  status?: 'ACTIVE' | 'SUSPENDED' | 'CANCELLED';
}
