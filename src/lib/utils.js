export function sanitizeUser(user) {
  // eslint-disable-next-line no-unused-vars
  const { hashedPassword: removedHashedPassword, ...safeUser } = user;
  return safeUser;
}
