import { IsString, IsOptional, IsIn } from 'class-validator';

export class CreateMemberDto {
  @IsString() cin: string;
  @IsString() fullName: string;
  @IsOptional() @IsString() city?: string;

  @IsOptional()
  @IsIn(['ACTIVE','SUSPENDED','CANCELLED'])
  status?: 'ACTIVE'|'SUSPENDED'|'CANCELLED';

  @IsString() delegateId: string; // ID d’un délégué existant
}
