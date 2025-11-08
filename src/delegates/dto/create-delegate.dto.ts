import { IsString, IsOptional } from 'class-validator';

export class CreateDelegateDto {
  @IsString() name: string;
  @IsOptional() @IsString() phone?: string;
  @IsString() regionId: string;
}
