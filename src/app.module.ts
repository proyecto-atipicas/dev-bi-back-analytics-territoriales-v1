import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CatalogosModule } from './modules/catalogos/catalogos.module';
import { ElectoralModule } from './modules/electoral/electoral.module';
import { GeoModule } from './modules/geo/geo.module';
import { HealthModule } from './modules/health/health.module';
import { HomeModule } from './modules/home/home.module';
import { PoblacionalModule } from './modules/poblacional/poblacional.module';
import { SocioeconomicoModule } from './modules/socioeconomico/socioeconomico.module';
import { CacheModule } from './shared/cache/cache.module';
import { appConfig } from './shared/config/app.config';
import { databaseConfig } from './shared/config/database.config';
import { validateEnv } from './shared/config/env.validation';
import { DatabaseModule } from './shared/database/database.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [appConfig, databaseConfig],
      validate: validateEnv,
    }),
    DatabaseModule,
    CacheModule,
    HealthModule,
    GeoModule,
    CatalogosModule,
    ElectoralModule,
    SocioeconomicoModule,
    PoblacionalModule,
    HomeModule,
  ],
})
export class AppModule {}
