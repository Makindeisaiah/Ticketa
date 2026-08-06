import { db, isDbConfigured } from './index.ts';
import { users } from './schema.ts';

export async function getOrCreateUser(uid: string, email: string, fullName?: string) {
  if (!isDbConfigured()) {
    return {
      id: uid,
      uid,
      email,
      fullName: fullName || email.split('@')[0],
      createdAt: new Date()
    };
  }

  try {
    const result = await db.insert(users)
      .values({
        uid,
        email,
        fullName: fullName || email.split('@')[0],
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email,
          ...(fullName ? { fullName } : {}),
        },
      })
      .returning();

    return result[0];
  } catch (error) {
    console.warn('Database query getOrCreateUser notice:', error);
    return {
      id: uid,
      uid,
      email,
      fullName: fullName || email.split('@')[0],
      createdAt: new Date()
    };
  }
}

