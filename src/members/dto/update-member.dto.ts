import { IsString, IsOptional, IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateMemberDto {
  @ApiPropertyOptional({ 
    description: 'CIN (Carte d\'identité nationale) of the member',
    example: '12345678'
  })
  @IsOptional()
  @IsString()
  cin?: string;

  @ApiPropertyOptional({ 
    description: 'Full name of the member',
    example: 'John Doe'
  })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiPropertyOptional({ 
    description: 'Status of the member',
    enum: ['ACTIVE', 'SUSPENDED', 'CANCELLED'],
    example: 'ACTIVE'
  })
  @IsOptional()
  @IsIn(['ACTIVE', 'SUSPENDED', 'CANCELLED'])
  status?: 'ACTIVE' | 'SUSPENDED' | 'CANCELLED';
}
