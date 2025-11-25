// src/users/users.service.ts
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { SAFE_USER_SELECT, hashPassword } from '../common/user.helpers';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateUserDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      throw new BadRequestException('Email déjà utilisé');
    }

    const passwordHash = await hashPassword(dto.password);

    return this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        password: passwordHash,
        role: dto.role,
      },
      select: SAFE_USER_SELECT,
    });
  }

  async findAll() {
    return this.prisma.user.findMany({
      where: { deletedAt: null },
      select: SAFE_USER_SELECT,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: SAFE_USER_SELECT,
    });

    if (!user) {
      throw new NotFoundException('User introuvable');
    }

    return user;
  }

  async update(id: string, dto: UpdateUserDto) {
    const existing = await this.prisma.user.findUnique({ where: { id } });
    if (!existing || existing.deletedAt) {
      throw new NotFoundException('User introuvable');
    }

    const data: any = {};

    if (dto.name !== undefined) data.name = dto.name;

    if (dto.email !== undefined && dto.email !== existing.email) {
      const emailOwner = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });
      if (emailOwner && emailOwner.id !== id) {
        throw new BadRequestException('Email déjà utilisé');
      }
      data.email = dto.email;
    }

    if (dto.password !== undefined) {
      data.password = await hashPassword(dto.password);
    }

    if (dto.role !== undefined) {
      data.role = dto.role;
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data,
      select: SAFE_USER_SELECT,
    });

    return updated;
  }

  async softDelete(id: string) {
    const existing = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, deletedAt: true },
    });

    if (!existing || existing.deletedAt) {
      throw new NotFoundException('User introuvable');
    }

    const deleted = await this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
      select: SAFE_USER_SELECT,
    });

    return deleted;
  }

  // Utilisée par AuthService pour le login
  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }
}

