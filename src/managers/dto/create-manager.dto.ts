import { IsUUID, IsOptional, IsISO8601 } from 'class-validator';

export class CreateManagerDto {
  @IsUUID()
  userId!: string;    // id d'un User (role REGION_MANAGER)

  @IsUUID()
  regionId!: string;  // id d'une Region

  @IsOptional()
  @IsISO8601()
  startAt?: string;   // ISO date optionnelle
}
