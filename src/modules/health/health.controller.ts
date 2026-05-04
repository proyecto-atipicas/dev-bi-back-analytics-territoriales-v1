import { Controller, Get, Inject } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DatabasePort } from '../../shared/database/database.port';
import { DATABASE_PORT } from '../../shared/database/database.tokens';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(@Inject(DATABASE_PORT) private readonly db: DatabasePort) {}

  @Get()
  liveness(): { status: 'ok'; timestamp: string } {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  @Get('readiness')
  async readiness(): Promise<{ status: 'ok' | 'degraded'; database: 'up' | 'down' }> {
    try {
      await this.db.queryOne('SELECT 1 AS ok');
      return { status: 'ok', database: 'up' };
    } catch {
      return { status: 'degraded', database: 'down' };
    }
  }
}
