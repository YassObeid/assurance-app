// src/users/dto/create-user.dto.ts
import { IsEmail, IsIn, IsString, MinLength } from 'class-validator';
import { Role } from '@prisma/client'; // enum Role { GM, REGION_MANAGER, DELEGATE }
export class CreateUserDto {
  @IsString()
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;

  @IsIn(Object.values(Role))
  role!: 'GM' | 'REGION_MANAGER' | 'DELEGATE';
}
