import { IsOptional, IsString, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdatePaymentDto {
  @ApiPropertyOptional({ 
    description: 'Payment amount as string (to preserve precision)',
    example: '150.50'
  })
  @IsOptional()
  @IsString()
  amount?: string;

  @ApiPropertyOptional({ 
    description: 'Date when payment was made (ISO 8601)',
    example: '2024-01-15T10:30:00Z'
  })
  @IsOptional()
  @IsDateString()
  paidAt?: string;

  @ApiPropertyOptional({ 
    description: 'Optional note or comment about the payment',
    example: 'Payment for January membership'
  })
  @IsOptional()
  @IsString()
  note?: string;

  // memberId and delegateId should not be updatable for audit trail
}
