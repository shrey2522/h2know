const USER_ID_PATTERN = /^H2KNOW-\d+$/;

export function isValidUserId(userId: string): boolean {
  return USER_ID_PATTERN.test(userId);
}

export function assertValidUserId(userId: string): void {
  if (!isValidUserId(userId)) {
    throw new Error("Invalid user ID");
  }
}

export function kvKey(userId: string, suffix: string): string {
  return `h2know:${userId}:${suffix}`;
}
