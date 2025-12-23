import { IsEmail, IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    example: 'gm@example. com',
    description: 'Email de l\'utilisateur',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'gm123456',
    description: 'Mot de passe',
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}