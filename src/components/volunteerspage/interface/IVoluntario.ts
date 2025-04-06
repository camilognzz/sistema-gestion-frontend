export interface IVoluntario {
  id?: number;
  documentoIdentidad: string;
  nombre: string;
  email?: string | null;
  telefono: string;
  direccion?: string | null;
  fechaNacimiento?: string | null;
  genero?: "MASCULINO" | "FEMENINO" | "OTRO" | null;
  profesion?: string | null;
  disponibilidad: "TIEMPO_COMPLETO" | "MEDIO_TIEMPO" | "OCASIONAL";
  fechaRegistro: string;
}
