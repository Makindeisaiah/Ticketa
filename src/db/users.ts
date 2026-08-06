export async function getOrCreateUser(uid: string, email: string, fullName?: string) {
  return {
    id: uid,
    uid,
    email,
    fullName: fullName || email.split('@')[0],
    createdAt: new Date()
  };
}


