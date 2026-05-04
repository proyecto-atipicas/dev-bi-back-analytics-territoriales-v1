import { Departamento } from '../entities/departamento.entity';
import { Municipio } from '../entities/municipio.entity';
import { Puesto } from '../entities/puesto.entity';

export const GEO_REPOSITORY = Symbol('GEO_REPOSITORY');

export interface GeoRepositoryPort {
  listarDepartamentos(): Promise<Departamento[]>;
  listarMunicipios(codigoDepartamento: string): Promise<Municipio[]>;
  /**
   * `codigo_municipio` no es único globalmente (los códigos '001'..'00x' se repiten
   * en cada departamento), por eso se exige también el `codigoDepartamento`.
   */
  listarPuestos(codigoDepartamento: string, codigoMunicipio: string): Promise<Puesto[]>;
}
