export interface IProyecto {
  id?: number;
  nombre: string;
  descripcion: string;
  responsable: { id: number; name?: string; email?: string; role?: string };
  fechaInicio: string;
  fechaFin: string;
  estado: "SIN_INICIAR" | "EN_PROGRESO" | "FINALIZADO" | "CANCELADO";
}