// src/users/dto/create-user.dto.ts
import { IsEmail, IsIn, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;

  @IsIn(['GM', 'REGION_MANAGER', 'DELEGATE'])
  role!: 'GM' | 'REGION_MANAGER' | 'DELEGATE';
}
