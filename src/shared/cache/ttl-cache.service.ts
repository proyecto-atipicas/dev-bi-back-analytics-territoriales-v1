import { Injectable } from '@nestjs/common';

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

/**
 * Cache TTL en memoria (single-process). Usado para catálogos estables
 * (corporaciones, partidos, departamentos) que se invalidan por tiempo.
 * No depende de `cache-manager` para evitar wrapping innecesario y
 * poder controlar el comportamiento de stampede con Promise dedup.
 */
@Injectable()
export class TtlCacheService {
  private readonly store = new Map<string, CacheEntry<unknown>>();
  private readonly inflight = new Map<string, Promise<unknown>>();

  async getOrSet<T>(key: string, ttlMs: number, factory: () => Promise<T>): Promise<T> {
    const now = Date.now();
    const hit = this.store.get(key) as CacheEntry<T> | undefined;
    if (hit && hit.expiresAt > now) return hit.value;

    const pending = this.inflight.get(key) as Promise<T> | undefined;
    if (pending) return pending;

    const promise = factory()
      .then((value) => {
        this.store.set(key, { value, expiresAt: Date.now() + ttlMs });
        return value;
      })
      .finally(() => {
        this.inflight.delete(key);
      });

    this.inflight.set(key, promise);
    return promise;
  }

  invalidate(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }
}
