export interface DatabasePort {
  query<T = unknown>(sql: string, params?: ReadonlyArray<unknown>): Promise<T[]>;

  queryOne<T = unknown>(sql: string, params?: ReadonlyArray<unknown>): Promise<T | null>;
}
