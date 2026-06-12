import { kv } from "@vercel/kv";
import { kvKey } from "./userId";

const memoryStore = new Map<string, unknown>();

function hasKvEnv(): boolean {
  return Boolean(
    process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN
  );
}

export async function kvGet<T>(userId: string, suffix: string): Promise<T | null> {
  const key = kvKey(userId, suffix);
  if (hasKvEnv()) {
    return (await kv.get<T>(key)) ?? null;
  }
  return (memoryStore.get(key) as T | undefined) ?? null;
}

export async function kvSet<T>(
  userId: string,
  suffix: string,
  value: T
): Promise<void> {
  const key = kvKey(userId, suffix);
  if (hasKvEnv()) {
    await kv.set(key, value);
    return;
  }
  memoryStore.set(key, value);
}

export async function kvDelete(userId: string, suffix: string): Promise<void> {
  const key = kvKey(userId, suffix);
  if (hasKvEnv()) {
    await kv.del(key);
    return;
  }
  memoryStore.delete(key);
}
