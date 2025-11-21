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
    // 1) Vérifier que l'email n'est pas déjà utilisé
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      throw new BadRequestException('Cet email est déjà utilisé');
    }

    // 2) Hasher le mot de passe
    const hashed = await hashPassword(dto.password);

    // 3) Créer l'user
    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        password: hashed,
        role: dto.role,
      },
      select: SAFE_USER_SELECT,
    });

    return user;
  }
   // Utilisé par le login
  findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }



  findAll() {
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
    // Vérifier que l'user existe
    const existing = await this.prisma.user.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('User introuvable');
    }

    const data: any = {};

    if (dto.name !== undefined) data.name = dto.name;

    if (dto.email !== undefined && dto.email !== existing.email) {
      // Vérifier unicité du nouvel email
      const emailTaken = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });
      if (emailTaken) {
        throw new BadRequestException('Cet email est déjà utilisé');
      }
      data.email = dto.email;
    }

    if (dto.role !== undefined) {
      data.role = dto.role;
    }

    if (dto.password) {
      data.password = await hashPassword(dto.password);
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data,
      select: SAFE_USER_SELECT,
    });

    return updated;
  }

  // "Soft delete" : on ne supprime pas vraiment, on marque comme supprimé
  async softDelete(id: string) {
    const existing = await this.prisma.user.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('User introuvable');
    }

    const deleted = await this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
      select: SAFE_USER_SELECT,
    });

    return deleted;
  }
}

