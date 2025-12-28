import { IsString, IsOptional, IsDateString } from 'class-validator';

export class CreateManagerDto {
  @IsString()
  userId: string; // ID du user qui sera manager

  @IsString()
  regionId: string; // ID de la région à gérer

  @IsOptional()
  @IsDateString()
  startAt?: string; // optionnel, sinon on met "maintenant" côté service
}
