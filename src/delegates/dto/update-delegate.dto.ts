import { IsString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateDelegateDto {
  @ApiPropertyOptional({ 
    description: 'Name of the delegate',
    example: 'Jane Smith'
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ 
    description: 'Phone number of the delegate',
    example: '+33612345678'
  })
  @IsOptional()
  @IsString()
  phone?: string;

  // regionId and managerId should not be updated via PATCH
  // Use dedicated endpoints for reassignment if needed
}