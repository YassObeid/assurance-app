import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateDelegateDto {
  @IsString() name: string;
  @IsOptional() @IsString() phone?: string;
  @IsString() regionId: string;
  @IsString() @IsNotEmpty() managerId: string;
  @IsOptional() @IsString() userId?: string;
}
