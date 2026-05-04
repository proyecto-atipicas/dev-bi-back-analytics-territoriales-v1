import { Global, Module } from '@nestjs/common';
import { DATABASE_PORT } from './database.tokens';
import { PostgresAdapter } from './postgres.adapter';

@Global()
@Module({
  providers: [
    PostgresAdapter,
    {
      provide: DATABASE_PORT,
      useExisting: PostgresAdapter,
    },
  ],
  exports: [DATABASE_PORT],
})
export class DatabaseModule {}
