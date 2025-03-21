export interface IContacto {
  id?: number; 
  nombre: string;
  tipoContacto: "INDIVIDUAL" | "EMPRESA";
  telefono: string;
  email: string;
  direccion?: string;
  cargo?: string;
  notas?: string;
  fechaRegistro: string;
}