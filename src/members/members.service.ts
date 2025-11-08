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

  findAll(q: QueryMemberDto) {
    const where: any = {};
    if (q.status) where.status = q.status;
    if (q.q) where.fullName = { contains: q.q, mode: 'insensitive' };

    return this.prisma.member.findMany({
      where,
      skip: q.skip,
      take: q.take,
      orderBy: { createdAt: 'desc' },
      select: {
        id:true, cin:true, fullName:true, city:true,
        status:true, delegateId:true, createdAt:true
      }
    });
  }

  findOne(id: string) {
    return this.prisma.member.findUnique({ where: { id } });
  }

  remove(id: string) {
    return this.prisma.member.delete({ where: { id } });
  }
}
