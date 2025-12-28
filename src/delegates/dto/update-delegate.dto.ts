import { PartialType } from '@nestjs/mapped-types';
import { CreateDelegateDto } from './create-delegate.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateDelegateDto extends PartialType(CreateDelegateDto) {}
