import { IsString, IsOptional } from 'class-validator';

export class UpdateDelegateDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsString() regionId?: string;
}
