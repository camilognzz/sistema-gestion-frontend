export interface IVoluntario {
  id?: number;
  documentoIdentidad: string;
  nombre: string;
  email?: string | null; // Permitimos null para reflejar campos vacíos en el backend
  telefono: string;
  direccion?: string | null; // Permitimos null
  fechaNacimiento?: string | null; // Permitimos null
  genero?: "MASCULINO" | "FEMENINO" | "OTRO" | null; // Permitimos null
  profesion?: string | null; // Permitimos null
  disponibilidad: "TIEMPO_COMPLETO" | "MEDIO_TIEMPO" | "OCASIONAL";
  fechaRegistro: string;
}