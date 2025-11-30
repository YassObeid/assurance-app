import { hashPassword, comparePassword } from './password.helper';

describe('password.helper', () => {
  it('hashPassword doit retourner un hash différent du mot de passe en clair', async () => {
    const plain = 'mon-super-mot-de-passe';
    const hash = await hashPassword(plain);

    expect(hash).toBeDefined();
    expect(hash).not.toEqual(plain);
    expect(hash.length).toBeGreaterThan(20); // un hash bcrypt est long
  });

  it('comparePassword doit retourner true pour un bon mot de passe', async () => {
    const plain = 'secret123';
    const hash = await hashPassword(plain);

    const ok = await comparePassword(plain, hash);
    expect(ok).toBe(true);
  });

  it('comparePassword doit retourner false pour un mauvais mot de passe', async () => {
    const plain = 'secret123';
    const hash = await hashPassword(plain);

    const ok = await comparePassword('mauvais', hash);
    expect(ok).toBe(false);
  });
});
