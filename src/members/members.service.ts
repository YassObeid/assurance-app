import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateMemberDto } from './dto/create-member.dto';
import { QueryMemberDto } from './dto/query-member.dto';

@Injectable()
export class MembersService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateMemberDto) {
    return this.prisma.member.create({ data: dto });
  }

 async findAll(q: QueryMemberDto) {
    const where: any = {};
    if (q.status) where.status = q.status;
    if (q.q) where.fullName = { contains: q.q, mode: 'insensitive' };

    const rows = await this.prisma.member.findMany({
      where,
      skip: q.skip,
      take: q.take,
      orderBy: { createdAt: 'desc' },
      include: {
        delegate: {
          include: {
            region: true,
            manager: { include: { user: true, region: true } },
            user: true,
          },
        },
      },
    });

    // flatten + alignement avec le style Delegates
    return rows.map(m => ({
      id: m.id,
      cin: m.cin,
      fullName: m.fullName,
      status: m.status,
      city: m.delegate?.region?.name ?? null,                // alias "city"
      delegate: m.delegate
        ? {
            id: m.delegate.id,
            name: m.delegate.name,
            phone: m.delegate.phone ?? null,
            regionId: m.delegate.regionId,
            regionName: m.delegate.region?.name ?? null,
            managerId: m.delegate.managerId,
            managerUserName: m.delegate.manager?.user?.name ?? null,
          }
        : null,
      createdAt: m.createdAt,
    }));
  }


  findOne(id: string) {
    return this.prisma.member.findUnique({
      where: { id },
      include: {
        delegate: {
          include: {
            region: true,
            manager: { include: { user: true, region: true } },
            user: true,
          },
        },
        payments: true,
      },
    });
  }


  remove(id: string) {
    return this.prisma.member.delete({ where: { id } });
  }
}
