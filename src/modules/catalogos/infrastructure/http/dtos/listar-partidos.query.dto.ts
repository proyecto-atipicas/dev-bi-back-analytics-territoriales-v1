import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class ListarPartidosQueryDto {
  @ApiPropertyOptional({ description: 'Filtrar partidos por código de corporación' })
  @IsOptional()
  @IsString()
  codigoCorporacion?: string;
}
