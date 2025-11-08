import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateDelegateDto } from './dto/create-delegate.dto';
import { UpdateDelegateDto } from './dto/update-delegate.dto';

@Injectable()
export class DelegatesService {
  constructor(private prisma: PrismaService) {}

  create(data: CreateDelegateDto) {
    return this.prisma.delegate.create({ data });
  }

  findAll() {
    return this.prisma.delegate.findMany({
      include: { region: true, members: true },
    });
  }

  findOne(id: string) {
    return this.prisma.delegate.findUnique({
      where: { id },
      include: { region: true, members: true },
    });
  }

  update(id: string, data: UpdateDelegateDto) {
    return this.prisma.delegate.update({
      where: { id },
      data,
    });
  }

  remove(id: string) {
    return this.prisma.delegate.delete({ where: { id } });
  }
}
