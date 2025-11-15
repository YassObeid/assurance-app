// src/users/dto/update-user.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsOptional, IsString, MinLength, IsIn, IsEmail } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  // On précise les champs optionnels pour être bien clair

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @IsOptional()
  @IsIn(['GM', 'REGION_MANAGER', 'DELEGATE'])
  role?: 'GM' | 'REGION_MANAGER' | 'DELEGATE';
}
