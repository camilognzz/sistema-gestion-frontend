export interface IVoluntario {
    id?: number;
    documentoIdentidad: string;
    nombre: string;
    email?: string;
    telefono: string;
    direccion?: string;
    fechaNacimiento?: string; 
    genero?: "MASCULINO" | "FEMENINO" | "OTRO";
    profesion?: string;
    disponibilidad: "TIEMPO_COMPLETO" | "MEDIO_TIEMPO" | "OCASIONAL";
    fechaRegistro: string; 
  }
  