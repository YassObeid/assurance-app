// src/payments/dto/create-payment.dto.ts
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsDateString,
} from 'class-validator';

export class CreatePaymentDto {
  @IsNotEmpty()
  @IsString()
  memberId!: string;

  @IsOptional()
  @IsDateString()
  paidAt?: string; // ISO string

  @IsNotEmpty()
  @IsString()
  amount!: string;

  @IsOptional()
  @IsString()
  note?: string;
}
