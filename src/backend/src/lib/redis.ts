// Redis removed — no caching layer needed with Supabase
export async function getCache<T>(_key: string): Promise<T | null> { return null; }
export async function setCache<T>(_key: string, _value: T, _ttl?: number): Promise<void> {}
export async function delCache(_key: string): Promise<void> {}
export async function delCachePattern(_pattern: string): Promise<void> {}
