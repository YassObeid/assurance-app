import { IsString, IsOptional, IsIn } from 'class-validator';

export class CreateMemberDto {
  @IsString()
  cin!: string;

  @IsString()
  fullName!: string;

  @IsOptional()
  @IsIn(['ACTIVE', 'SUSPENDED', 'CANCELLED'])
  status?: 'ACTIVE' | 'SUSPENDED' | 'CANCELLED';
}
