import { Module } from '@nestjs/common';
import { ElectoralModule } from '../electoral/electoral.module';
import { PoblacionalModule } from '../poblacional/poblacional.module';
import { SocioeconomicoModule } from '../socioeconomico/socioeconomico.module';
import { ObtenerDashboardHomeUseCase } from './application/use-cases/obtener-dashboard-home.use-case';
import { HomeController } from './infrastructure/http/home.controller';

@Module({
  imports: [ElectoralModule, SocioeconomicoModule, PoblacionalModule],
  controllers: [HomeController],
  providers: [ObtenerDashboardHomeUseCase],
})
export class HomeModule {}
