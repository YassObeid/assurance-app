// src/users/user.helpers.ts
import * as bcrypt from 'bcrypt';

// Sélection sécurisée (on NE renvoie jamais le password)
export const SAFE_USER_SELECT = {
  id: true,
  name: true,
  email: true,
  role: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
};

// Hash du mot de passe (centralisé ici)
export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}
