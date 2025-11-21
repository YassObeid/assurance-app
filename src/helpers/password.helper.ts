// src/common/helpers/password.helper.ts
import * as bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

// Hash pour stocker en base
export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

// Comparer mot de passe en clair vs hash en base
export async function comparePassword(
  plain: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}
