export interface IProyecto {
    id?: number; // Hacerlo opcional para reflejar el backend
    nombre: string;
    descripcion: string;
    responsable: { id: number; name: string; email: string; role: string };
    fechaInicio: string;
    fechaFin: string;
    estado: "SIN_INICIAR" | "EN_PROGRESO" | "FINALIZADO" | "CANCELADO";
  }