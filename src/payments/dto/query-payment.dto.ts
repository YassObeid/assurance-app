import { IsOptional, IsString, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class QueryPaymentDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Filter by member ID',
    example: 'member-uuid',
  })
  @IsOptional()
  @IsString()
  memberId?: string;

  @ApiPropertyOptional({
    description: 'Filter by delegate ID',
    example: 'delegate-uuid',
  })
  @IsOptional()
  @IsString()
  delegateId?: string;

  @ApiPropertyOptional({
    description: 'Filter payments from this date (ISO format)',
    example: '2024-01-01',
  })
  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @ApiPropertyOptional({
    description: 'Filter payments until this date (ISO format)',
    example: '2024-12-31',
  })
  @IsOptional()
  @IsDateString()
  toDate?: string;
}
